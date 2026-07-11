import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api_client.dart';

class ChatMsg {
  final String role, content;
  final Map<String, dynamic>? action;
  ChatMsg(this.role, this.content, {this.action});
}

class AIScreen extends ConsumerStatefulWidget {
  const AIScreen({super.key});
  @override
  ConsumerState<AIScreen> createState() => _AIScreenState();
}

class _AIScreenState extends ConsumerState<AIScreen> {
  final _messages = <ChatMsg>[
    ChatMsg('assistant',
        'Namaste. Tell me what you need. I will show the task before anything is submitted.')
  ];
  final _input = TextEditingController();
  bool _busy = false;
  Future<void> _send(String text) async {
    if (text.trim().isEmpty || _busy) return;
    setState(() {
      _messages.add(ChatMsg('user', text.trim()));
      _input.clear();
      _busy = true;
    });
    try {
      final response = await ref
          .read(apiClientProvider)
          .dio
          .post('/ai/chat', data: {'message': text.trim(), 'language': 'en'});
      final data = response.data as Map<String, dynamic>;
      setState(() => _messages.add(ChatMsg('assistant', data['reply'] as String,
          action: data['action'] as Map<String, dynamic>?)));
    } catch (_) {
      setState(() => _messages.add(ChatMsg('assistant',
          'I could not reach the service. Please retry or use the manual form.')));
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _decide(Map<String, dynamic> action, String decision) async {
    setState(() => _busy = true);
    try {
      final response = await ref
          .read(apiClientProvider)
          .dio
          .post('/ai/actions/${action['id']}/$decision');
      setState(() => _messages
          .add(ChatMsg('assistant', response.data['message'] as String)));
    } catch (_) {
      setState(() => _messages.add(ChatMsg('assistant',
          'That task could not be completed. Nothing was changed.')));
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Ask Panchayat'), actions: [
        IconButton(
            tooltip: 'Language',
            onPressed: () {},
            icon: const Icon(Icons.translate))
      ]),
      body: Column(children: [
        MaterialBanner(
            content: const Text(
                'Voice input depends on your device. Text and all manual services always remain available.'),
            leading: const Icon(Icons.privacy_tip_outlined),
            actions: [
              TextButton(
                  onPressed: () =>
                      ScaffoldMessenger.of(context).hideCurrentMaterialBanner(),
                  child: const Text('GOT IT'))
            ]),
        Expanded(
            child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (_, index) {
                  final message = _messages[index];
                  final mine = message.role == 'user';
                  return Align(
                      alignment:
                          mine ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                          constraints: const BoxConstraints(maxWidth: 360),
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                              color: mine
                                  ? Theme.of(context).colorScheme.primary
                                  : Theme.of(context).colorScheme.surface,
                              borderRadius: BorderRadius.circular(18),
                              border: mine
                                  ? null
                                  : Border.all(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .outlineVariant)),
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(message.content,
                                    style: TextStyle(
                                        color: mine
                                            ? Theme.of(context)
                                                .colorScheme
                                                .onPrimary
                                            : null)),
                                if (message.action != null) ...[
                                  const Divider(height: 28),
                                  const Text('ACTION TO REVIEW',
                                      style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800)),
                                  const SizedBox(height: 6),
                                  Text(message.action!['summary'] as String,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w700)),
                                  const SizedBox(height: 10),
                                  const Text(
                                      'Nothing is submitted until you confirm.',
                                      style: TextStyle(fontSize: 12)),
                                  const SizedBox(height: 12),
                                  Wrap(spacing: 8, children: [
                                    FilledButton.icon(
                                        onPressed: _busy
                                            ? null
                                            : () => _decide(
                                                message.action!, 'confirm'),
                                        icon: const Icon(
                                            Icons.check_circle_outline),
                                        label: const Text('Confirm')),
                                    OutlinedButton(
                                        onPressed: _busy
                                            ? null
                                            : () => _decide(
                                                message.action!, 'cancel'),
                                        child: const Text('Cancel'))
                                  ])
                                ]
                              ])));
                })),
        if (_busy) const LinearProgressIndicator(),
        SafeArea(
            child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(children: [
                  IconButton.filled(
                      tooltip: 'Voice input',
                      onPressed: () => ScaffoldMessenger.of(context)
                          .showSnackBar(const SnackBar(
                              content: Text(
                                  'Voice recognition is not configured on this device. Please type your request.'))),
                      icon: const Icon(Icons.mic_rounded)),
                  const SizedBox(width: 8),
                  Expanded(
                      child: TextField(
                          controller: _input,
                          decoration: const InputDecoration(
                              hintText: 'Type in your own words'),
                          onSubmitted: _send)),
                  const SizedBox(width: 8),
                  IconButton.filled(
                      tooltip: 'Send',
                      onPressed: _busy ? null : () => _send(_input.text),
                      icon: const Icon(Icons.send_rounded))
                ])))
      ]));
}
