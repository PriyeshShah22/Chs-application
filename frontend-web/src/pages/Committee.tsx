import { CampaignRounded, GroupsRounded, PaymentsRounded, ReportProblemRounded, ShieldRounded, TrendingUpRounded } from "@mui/icons-material";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ErrorPanel, LoadingPanel } from "../components/StateViews";
import { useI18n } from "../store/language";
import type { AdminStats } from "../types/api";

const destinations = [
  { path: "/complaints", label: "Manage complaints", detail: "Review, assign, and resolve resident complaints.", icon: <ReportProblemRounded /> },
  { path: "/notices", label: "Society notices", detail: "Publish updates and keep residents informed.", icon: <CampaignRounded /> },
  { path: "/visitors", label: "Visitor approvals", detail: "Review pass requests and support the gate team.", icon: <ShieldRounded /> },
  { path: "/residents", label: "People directory", detail: "Find verified residents and society staff.", icon: <GroupsRounded /> },
] as const;

export default function Committee() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get<AdminStats>("/admin/stats")).data,
  });

  if (stats.isLoading) return <LoadingPanel />;
  if (stats.isError) return <ErrorPanel message="Committee statistics could not be loaded. Please try again." />;

  return <Stack spacing={3}>
    <Box>
      <Typography variant="overline" color="primary" fontWeight={900} letterSpacing={1.5}>{t("COMMITTEE WORKSPACE")}</Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: "2.5rem", md: "3.8rem" } }}>{t("Committee Area")}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>{t("A clear view of the society and quick access to the responsibilities entrusted to committee members.")}</Typography>
    </Box>

    <Paper sx={{ p: { xs: 3, md: 4 }, bgcolor: "#173F35", color: "white", border: 0 }}>
      <Typography variant="overline" sx={{ opacity: .68 }}>{t("SOCIETY AT A GLANCE")}</Typography>
      <Typography variant="h3" sx={{ mt: .5 }}>{stats.data?.complaints_open ?? 0} {t("matters need attention")}</Typography>
      <Typography sx={{ mt: 1, opacity: .76 }}>{t("Use the regular Help, Notices, Gate, and People areas to take action. Monthly billing and audit logs remain with administrators.")}</Typography>
    </Paper>

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 1.5 }}>
      <Metric label={t("Active residents")} value={stats.data?.users_active ?? 0} icon={<GroupsRounded />} color="#3A6EA5" />
      <Metric label={t("Open complaints")} value={stats.data?.complaints_open ?? 0} icon={<ReportProblemRounded />} color="#D76049" />
      <Metric label={t("Overdue accounts")} value={stats.data?.bills_overdue ?? 0} icon={<PaymentsRounded />} color="#C67A20" />
      <Metric label={t("Verified users")} value={stats.data?.users_total ?? 0} icon={<TrendingUpRounded />} color="#2B805F" />
    </Box>

    <Box>
      <Typography variant="h4">{t("Committee responsibilities")}</Typography>
      <Typography color="text.secondary" sx={{ mt: .5 }}>{t("Open any area below to exercise committee permissions in its normal workflow.")}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5, mt: 2 }}>
        {destinations.map((item) => <Paper key={item.path} sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box sx={{ width: 46, height: 46, display: "grid", placeItems: "center", bgcolor: "action.hover", color: "primary.main", borderRadius: 2, flexShrink: 0 }}>{item.icon}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{t(item.label)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: .25 }}>{t(item.detail)}</Typography>
              <Button onClick={() => navigate(item.path)} sx={{ mt: 1, px: 0 }}>{t("Open area")}</Button>
            </Box>
          </Stack>
        </Paper>)}
      </Box>
    </Box>
  </Stack>;
}

function Metric({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return <Paper sx={{ p: 2.5, borderTop: `4px solid ${color}` }}><Stack direction="row" justifyContent="space-between" spacing={1}><Box><Typography variant="h4">{value}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></Box><Box sx={{ color }}>{icon}</Box></Stack></Paper>;
}
