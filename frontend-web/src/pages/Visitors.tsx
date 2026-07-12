import { useMemo, useState } from "react";
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { CheckRounded, CloseRounded, DirectionsCarRounded, DoorFrontRounded, HowToRegRounded, LoginRounded, LogoutRounded, PersonAddAltRounded, PhoneRounded, SearchRounded, ShieldRounded, TodayRounded } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { api } from "../api/client";
import { LoadingPanel } from "../components/StateViews";
import { useAuthStore } from "../store/auth";
import type { Flat, Visitor } from "../types/api";

type ResidentProfile = { flat_id: number };
const statusTone: Record<string, "default" | "warning" | "success" | "error" | "info"> = { pending: "warning", approved: "info", rejected: "error", checked_in: "success", checked_out: "default" };

export default function Visitors() {
  const qc = useQueryClient();
  const me = useAuthStore((state) => state.user);
  const manager = Boolean(me?.is_superuser || me?.roles.some((role) => ["admin", "committee", "security"].includes(role.name)));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ flat_id: "", name: "", phone: "", purpose: "", vehicle_number: "", expected_at: "" });
  const profile = useQuery({ queryKey: ["resident-profile"], queryFn: async () => (await api.get<ResidentProfile>("/residents/me")).data, retry: false });
  const flats = useQuery({ queryKey: ["society-flats"], queryFn: async () => (await api.get<Flat[]>("/societies/flats")).data, enabled: manager });
  const list = useQuery({ queryKey: ["visitors"], queryFn: async () => (await api.get<Visitor[]>("/visitors/?limit=200")).data });
  const reset = () => setForm({ flat_id: "", name: "", phone: "", purpose: "", vehicle_number: "", expected_at: "" });
  const create = useMutation({
    mutationFn: async () => api.post("/visitors/", { society_id: me?.society_id, flat_id: manager ? Number(form.flat_id) : profile.data?.flat_id, name: form.name.trim(), phone: form.phone.trim() || null, purpose: form.purpose.trim() || null, vehicle_number: form.vehicle_number.trim().toUpperCase() || null, expected_at: form.expected_at || null }),
    onSuccess: async () => { enqueueSnackbar("Gate pass created", { variant: "success" }); setDialogOpen(false); reset(); await qc.invalidateQueries({ queryKey: ["visitors"] }); },
    onError: (error: any) => enqueueSnackbar(error?.response?.data?.detail || "Gate pass could not be created", { variant: "error" }),
  });
  const action = useMutation({ mutationFn: async ({ id, kind }: { id: number; kind: string }) => api.post(`/visitors/${id}/action`, { action: kind }), onSuccess: async (_data, variables) => { enqueueSnackbar(actionLabel(variables.kind), { variant: "success" }); await qc.invalidateQueries({ queryKey: ["visitors"] }); }, onError: (error: any) => enqueueSnackbar(error?.response?.data?.detail || "Gate status could not be changed", { variant: "error" }) });
  const visitors = useMemo(() => (list.data ?? []).filter((visitor) => {
    const active = ["pending", "approved", "checked_in"].includes(visitor.status);
    const tabMatch = tab === "all" || (tab === "active" ? active : !active);
    const term = `${visitor.name} ${visitor.phone || ""} ${visitor.purpose || ""} ${visitor.vehicle_number || ""}`.toLowerCase();
    return tabMatch && term.includes(search.toLowerCase());
  }), [list.data, search, tab]);
  if (list.isLoading) return <LoadingPanel />;
  const all = list.data ?? [];
  return <Stack spacing={3}>
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "end" }} spacing={2}><Box><Typography variant="overline" color="primary" fontWeight={900} letterSpacing={1.6}>GATE DESK</Typography><Typography variant="h2" sx={{ fontSize: { xs: "2.4rem", md: "3.7rem" } }}>Know who is at the gate</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Fast approvals for residents. Clear check-in and check-out controls for security.</Typography></Box><Button variant="contained" size="large" startIcon={<PersonAddAltRounded />} onClick={() => setDialogOpen(true)}>Create gate pass</Button></Stack>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5 }}><GateMetric icon={<DoorFrontRounded />} label="Inside now" value={all.filter((v) => v.status === "checked_in").length} color="#2B805F" /><GateMetric icon={<TodayRounded />} label="Expected" value={all.filter((v) => v.status === "approved").length} color="#3A6EA5" /><GateMetric icon={<HowToRegRounded />} label="Awaiting approval" value={all.filter((v) => v.status === "pending").length} color="#C67A20" /><GateMetric icon={<ShieldRounded />} label="Completed" value={all.filter((v) => v.status === "checked_out").length} color="#6D729C" /></Box>
    <Paper sx={{ overflow: "hidden" }}><Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={1} sx={{ px: 2, pt: 1 }}><Tabs value={tab} onChange={(_event, value) => setTab(value)} aria-label="Visitor record filter"><Tab value="active" label="At gate & expected" /><Tab value="history" label="History" /><Tab value="all" label="All" /></Tabs><TextField size="small" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, vehicle" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} sx={{ minWidth: { md: 290 }, pb: { xs: 2, md: 1 } }} /></Stack><Divider />
      <Stack divider={<Divider />}>{visitors.map((visitor) => <VisitorRow key={visitor.id} visitor={visitor} manager={manager} busy={action.isPending} onAction={(kind) => action.mutate({ id: visitor.id, kind })} />)}{visitors.length === 0 && <Box sx={{ py: 8, textAlign: "center" }}><DoorFrontRounded sx={{ fontSize: 48, color: "text.disabled" }} /><Typography variant="h6" sx={{ mt: 1 }}>No gate records here</Typography><Typography color="text.secondary">Try another filter or create a visitor pass.</Typography></Box>}</Stack>
    </Paper>
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Create a gate pass</DialogTitle><DialogContent><Typography color="text.secondary" sx={{ mb: 2 }}>Add only the details security needs to identify and admit this visitor.</Typography><Stack spacing={2}>{manager && <TextField select required label="Resident flat" value={form.flat_id} onChange={(event) => setForm({ ...form, flat_id: event.target.value })} helperText="Choose the household this visitor is meeting.">{(flats.data ?? []).map((flat) => <MenuItem key={flat.id} value={String(flat.id)}>Flat {flat.number} · Floor {flat.floor}</MenuItem>)}</TextField>}<TextField required autoFocus label="Visitor name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><TextField label="Mobile number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneRounded /></InputAdornment> }} /><TextField label="Purpose of visit" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} /><TextField label="Vehicle number" value={form.vehicle_number} onChange={(event) => setForm({ ...form, vehicle_number: event.target.value })} InputProps={{ startAdornment: <InputAdornment position="start"><DirectionsCarRounded /></InputAdornment> }} /><TextField label="Expected time" type="datetime-local" value={form.expected_at} onChange={(event) => setForm({ ...form, expected_at: event.target.value })} InputLabelProps={{ shrink: true }} /></Stack></DialogContent><DialogActions><Button onClick={() => setDialogOpen(false)}>Cancel</Button><Button variant="contained" disabled={!form.name.trim() || (manager && !form.flat_id) || create.isPending || (!manager && !profile.data?.flat_id)} onClick={() => create.mutate()}>Create pass</Button></DialogActions></Dialog>
  </Stack>;
}

function VisitorRow({ visitor, manager, busy, onAction }: { visitor: Visitor; manager: boolean; busy: boolean; onAction: (kind: string) => void }) {
  return <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} spacing={2} sx={{ p: 2.25 }}><Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "action.hover", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 18 }}>{visitor.name.slice(0, 1).toUpperCase()}</Box><Box sx={{ minWidth: 0, flex: 1 }}><Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap"><Typography fontWeight={850}>{visitor.name}</Typography><Chip size="small" label={visitor.status.replaceAll("_", " ")} color={statusTone[visitor.status] || "default"} /></Stack><Typography variant="body2" color="text.secondary">Flat {visitor.flat_id} · {visitor.purpose || "Purpose not provided"}{visitor.vehicle_number ? ` · ${visitor.vehicle_number}` : ""}</Typography><Typography variant="caption" color="text.secondary">{visitor.expected_at ? `Expected ${new Date(visitor.expected_at).toLocaleString()}` : `Created ${new Date(visitor.created_at).toLocaleString()}`}</Typography></Box><Stack direction="row" spacing={1} flexWrap="wrap">{visitor.status === "pending" && <><Button size="small" variant="contained" startIcon={<CheckRounded />} disabled={busy} onClick={() => onAction("approve")}>Approve</Button><IconButton color="error" aria-label={`Reject ${visitor.name}`} disabled={busy} onClick={() => onAction("reject")}><CloseRounded /></IconButton></>}{manager && visitor.status === "approved" && <Button size="small" variant="contained" startIcon={<LoginRounded />} disabled={busy} onClick={() => onAction("check_in")}>Check in</Button>}{manager && visitor.status === "checked_in" && <Button size="small" variant="outlined" startIcon={<LogoutRounded />} disabled={busy} onClick={() => onAction("check_out")}>Check out</Button>}</Stack></Stack>;
}

function GateMetric({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) { return <Paper sx={{ p: 2, borderTop: `4px solid ${color}` }}><Stack direction="row" justifyContent="space-between" alignItems="start"><Box><Typography variant="h4">{value}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></Box><Box sx={{ color }}>{icon}</Box></Stack></Paper>; }
function actionLabel(kind: string) { return ({ approve: "Visitor approved", reject: "Visitor rejected", check_in: "Visitor checked in", check_out: "Visitor checked out" } as Record<string, string>)[kind] || "Gate record updated"; }
