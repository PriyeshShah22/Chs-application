import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CircleRounded,
  CloseRounded,
  DoneAllRounded,
  HomeWorkRounded,
  MarkEmailUnreadRounded,
  NotificationsNoneRounded,
  ShieldRounded,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuthStore } from "../store/auth";
import { formatSocietyDateTime } from "../utils/dateTime";

type Notification = { id: number; kind: string; title: string; message: string; entity_type?: string | null; entity_id?: number | null; read_at?: string | null; created_at: string };
type JoinRequest = { id: number; full_name: string; email: string; phone?: string | null; date_of_birth: string; building_name: string; flat_number: string; created_at: string };

export default function NotificationInbox() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"updates" | "membership">("updates");
  const [selected, setSelected] = useState<JoinRequest | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAdmin = Boolean(user?.is_superuser || user?.roles.some((role) => role.name === "admin"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notifications = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get<Notification[]>("/notifications/")).data, refetchInterval: 30_000 });
  const requests = useQuery({ queryKey: ["join-requests"], queryFn: async () => (await api.get<JoinRequest[]>("/admin/join-requests")).data, enabled: isAdmin, refetchInterval: 30_000 });
  const rows = notifications.data ?? [];
  const requestRows = requests.data ?? [];
  const unread = rows.filter((row) => !row.read_at).length;
  const totalPending = unread + requestRows.length;
  const read = useMutation({ mutationFn: async (id: number) => api.post(`/notifications/${id}/read`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const readAll = useMutation({ mutationFn: async () => api.post("/notifications/read-all"), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }) });
  const review = useMutation({
    mutationFn: async ({ id, decision }: { id: number; decision: "approve" | "reject" }) => api.post(`/admin/join-requests/${id}/${decision}`),
    onSuccess: async (_data, variables) => {
      enqueueSnackbar(variables.decision === "approve" ? "Member approved and linked to their flat" : "Request rejected", { variant: "success" });
      setSelected(null);
      await queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
    onError: (error: any) => enqueueSnackbar(error?.response?.data?.detail || "Request could not be reviewed", { variant: "error" }),
  });

  const close = () => { setOpen(false); setSelected(null); };
  const openNotification = (row: Notification) => {
    if (!row.read_at) read.mutate(row.id);
    const routes: Record<string, string> = { visitor: "/visitors", complaint: "/complaints", notice: "/notices", bill: "/bills" };
    if (row.entity_type && routes[row.entity_type]) navigate(routes[row.entity_type]);
    close();
  };

  return <>
    <Tooltip title={isAdmin ? "Inbox" : "Notifications"}><IconButton aria-label={`${totalPending} pending inbox items`} onClick={() => setOpen(true)}><Badge badgeContent={totalPending} color="error"><NotificationsNoneRounded /></Badge></IconButton></Tooltip>
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle><Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}><Box><Typography variant="h5">{isAdmin ? "Inbox" : "Notifications"}</Typography><Typography variant="body2" color="text.secondary">{isAdmin ? "Society updates and membership requests" : "Visitor approvals and society updates"}</Typography></Box><IconButton aria-label="Close inbox" onClick={close}><CloseRounded /></IconButton></Stack></DialogTitle>
      {isAdmin && !selected && <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="fullWidth" aria-label="Inbox sections"><Tab value="updates" label={<Badge badgeContent={unread} color="error">Updates</Badge>} /><Tab value="membership" label={<Badge badgeContent={requestRows.length} color="error">Membership</Badge>} /></Tabs>}
      <DialogContent dividers sx={{ p: selected ? 3 : 0 }}>
        {selected ? <MembershipDetails request={selected} /> : tab === "membership" && isAdmin ? <MembershipList rows={requestRows} loading={requests.isLoading} onSelect={setSelected} /> : <NotificationList rows={rows} loading={notifications.isLoading} unread={unread} onReadAll={() => readAll.mutate()} onOpen={openNotification} />}
      </DialogContent>
      {selected && <DialogActions><Button onClick={() => setSelected(null)} disabled={review.isPending}>Back</Button><Box sx={{ flex: 1 }} /><Button color="error" disabled={review.isPending} onClick={() => review.mutate({ id: selected.id, decision: "reject" })}>Reject</Button><Button variant="contained" disabled={review.isPending} onClick={() => review.mutate({ id: selected.id, decision: "approve" })}>Approve and link flat</Button></DialogActions>}
    </Dialog>
  </>;
}

function NotificationList({ rows, loading, unread, onReadAll, onOpen }: { rows: Notification[]; loading: boolean; unread: number; onReadAll: () => void; onOpen: (row: Notification) => void }) {
  return <>{unread > 0 && <Stack direction="row" justifyContent="flex-end" sx={{ px: 2, py: 1 }}><Button size="small" startIcon={<DoneAllRounded />} onClick={onReadAll}>Mark all read</Button></Stack>}<List disablePadding>{rows.map((row, index) => <Box key={row.id}>{index > 0 && <Divider />}<ListItemButton onClick={() => onOpen(row)} sx={{ py: 1.75, alignItems: "flex-start", bgcolor: row.read_at ? "transparent" : "action.hover" }}><ListItemIcon sx={{ minWidth: 42, color: row.kind === "visitor_approved" ? "success.main" : "warning.main", pt: .25 }}><ShieldRounded /></ListItemIcon><ListItemText primary={<Stack direction="row" alignItems="center" gap={1}><Typography fontWeight={row.read_at ? 700 : 900}>{row.title}</Typography>{!row.read_at && <CircleRounded color="primary" sx={{ fontSize: 9 }} />}</Stack>} secondary={<><Typography component="span" variant="body2" color="text.secondary">{row.message}</Typography><Typography component="span" display="block" variant="caption" color="text.disabled" sx={{ mt: .5 }}>{formatSocietyDateTime(row.created_at)} IST</Typography></>} /></ListItemButton></Box>)}{!loading && rows.length === 0 && <EmptyInbox icon={<NotificationsNoneRounded sx={{ fontSize: 46 }} />} title="You’re all caught up" text="New society updates will appear here." />}</List></>;
}

function MembershipList({ rows, loading, onSelect }: { rows: JoinRequest[]; loading: boolean; onSelect: (request: JoinRequest) => void }) {
  if (loading) return <Typography color="text.secondary" sx={{ p: 3 }}>Loading requests…</Typography>;
  if (!rows.length) return <EmptyInbox icon={<MarkEmailUnreadRounded sx={{ fontSize: 46 }} />} title="No pending requests" text="New membership applications will appear here." />;
  return <List disablePadding>{rows.map((request, index) => <Box key={request.id}>{index > 0 && <Divider />}<ListItemButton onClick={() => onSelect(request)} sx={{ py: 1.75 }}><ListItemIcon sx={{ minWidth: 44, color: "primary.main" }}><HomeWorkRounded /></ListItemIcon><ListItemText primary={<Typography fontWeight={850}>{request.full_name}</Typography>} secondary={`${request.building_name} · Flat ${request.flat_number} · ${request.email}`} /><Typography color="primary" fontWeight={850}>Review</Typography></ListItemButton></Box>)}</List>;
}

function MembershipDetails({ request }: { request: JoinRequest }) {
  return <Stack spacing={2}><Typography variant="overline" color="primary" fontWeight={900}>APPLICANT DETAILS</Typography><Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}><Stack direction="row" spacing={1.5} alignItems="center"><HomeWorkRounded color="primary" /><Box><Typography fontWeight={900}>Wing {request.building_name} · Flat {request.flat_number}</Typography><Typography variant="caption" color="text.secondary">Requested household</Typography></Box></Stack></Box><Detail label="Full name" value={request.full_name} /><Detail label="Date of birth" value={new Date(`${request.date_of_birth}T00:00:00`).toLocaleDateString()} /><Detail label="Email" value={request.email} /><Detail label="Phone" value={request.phone || "Not provided"} /><Detail label="Requested" value={formatSocietyDateTime(request.created_at)} /><Typography variant="body2" color="text.secondary">The password is securely stored and is never displayed.</Typography></Stack>;
}

function Detail({ label, value }: { label: string; value: string }) { return <Box><Typography variant="caption" color="text.secondary" fontWeight={800}>{label}</Typography><Typography fontWeight={750}>{value}</Typography></Box>; }
function EmptyInbox({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <Box sx={{ py: 7, px: 2, textAlign: "center", color: "text.disabled" }}>{icon}<Typography variant="h6" color="text.primary" sx={{ mt: 1 }}>{title}</Typography><Typography color="text.secondary">{text}</Typography></Box>; }
