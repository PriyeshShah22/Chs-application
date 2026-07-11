import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../services/services.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final bills = ref.watch(billListProvider);
    final complaints = ref.watch(complaintListProvider);
    final notices = ref.watch(noticeListProvider);
    final due = bills.maybeWhen(
        data: (rows) =>
            rows.where((b) => b.status.toLowerCase() != 'paid').length,
        orElse: () => 0);
    final open = complaints.maybeWhen(
        data: (rows) => rows
            .where(
                (c) => !['resolved', 'closed'].contains(c.status.toLowerCase()))
            .length,
        orElse: () => 0);
    return Scaffold(
        appBar: AppBar(
            title:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                  'Namaste, ${auth.user?.fullName.split(' ').first ?? 'friend'}',
                  style: const TextStyle(fontWeight: FontWeight.w800)),
              const Text('How can we help today?',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.normal))
            ]),
            actions: [
              IconButton(
                  tooltip: 'Profile',
                  onPressed: () => context.go('/profile'),
                  icon: const Icon(Icons.account_circle_outlined))
            ]),
        body: RefreshIndicator(
            onRefresh: () async {
              ref.read(billListProvider.notifier).refresh();
              ref.read(complaintListProvider.notifier).refresh();
              ref.read(noticeListProvider.notifier).refresh();
            },
            child: ListView(padding: const EdgeInsets.all(16), children: [
              Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                      color: const Color(0xFF176B52),
                      borderRadius: BorderRadius.circular(24)),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Tell us what you need',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 26,
                                fontWeight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        const Text(
                            'Speak naturally. We will show the task before anything is submitted.',
                            style: TextStyle(color: Colors.white, height: 1.5)),
                        const SizedBox(height: 20),
                        FilledButton.icon(
                            style: FilledButton.styleFrom(
                                backgroundColor: const Color(0xFFE39A31),
                                foregroundColor: const Color(0xFF2B2114)),
                            onPressed: () => context.go('/ai'),
                            icon: const Icon(Icons.mic_rounded),
                            label: const Text('Speak to Panchayat')),
                        const SizedBox(height: 8),
                        TextButton.icon(
                            onPressed: () => context.go('/ai'),
                            icon: const Icon(Icons.keyboard_alt_outlined),
                            label: const Text('Type instead'),
                            style: TextButton.styleFrom(
                                foregroundColor: Colors.white))
                      ])),
              const SizedBox(height: 24),
              Text('Your information',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(
                    child: _tile(context, 'Open complaints', '$open',
                        Icons.report_problem_outlined, '/complaints')),
                const SizedBox(width: 12),
                Expanded(
                    child: _tile(context, 'Bills due', '$due',
                        Icons.receipt_long_outlined, '/bills'))
              ]),
              const SizedBox(height: 24),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('Important notices',
                    style: Theme.of(context).textTheme.titleLarge),
                TextButton(
                    onPressed: () => context.go('/notices'),
                    child: const Text('View all'))
              ]),
              ...notices.when(
                  data: (rows) => rows
                      .take(3)
                      .map((n) => Card(
                          child: ListTile(
                              minVerticalPadding: 16,
                              leading: CircleAvatar(
                                  child: Icon(n.isPinned
                                      ? Icons.push_pin_outlined
                                      : Icons.campaign_outlined)),
                              title: Text(n.title,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w700)),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () => context.go('/notices'))))
                      .toList(),
                  loading: () => [const LinearProgressIndicator()],
                  error: (_, __) => [
                        const Card(
                            child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Text(
                                    'Notices could not be loaded. Pull down to retry.')))
                      ]),
              const SizedBox(height: 16),
              const Card(
                  child: ListTile(
                      minVerticalPadding: 16,
                      leading: CircleAvatar(
                          backgroundColor: Color(0xFFFFE8E8),
                          child: Icon(Icons.emergency_outlined,
                              color: Color(0xFFB73A3A))),
                      title: Text('Emergency help',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: Text('View verified local contacts'),
                      trailing: Icon(Icons.chevron_right)))
            ])));
  }

  Widget _tile(BuildContext context, String label, String value, IconData icon,
          String route) =>
      Card(
          child: InkWell(
              borderRadius: BorderRadius.circular(20),
              onTap: () => context.go(route),
              child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(icon,
                            color: Theme.of(context).colorScheme.primary),
                        const SizedBox(height: 16),
                        Text(value,
                            style: Theme.of(context).textTheme.headlineMedium),
                        Text(label)
                      ]))));
}
