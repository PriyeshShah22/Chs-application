import 'package:flutter/material.dart';

class AppTheme {
  static const _seed = Color(0xFF176B52);
  static ThemeData light() => _base(
      ColorScheme.fromSeed(seedColor: _seed, brightness: Brightness.light),
      const Color(0xFFF6F4EC));
  static ThemeData dark() => _base(
      ColorScheme.fromSeed(seedColor: _seed, brightness: Brightness.dark),
      const Color(0xFF0E1714));
  static ThemeData _base(ColorScheme scheme, Color background) => ThemeData(
        useMaterial3: true,
        colorScheme: scheme,
        scaffoldBackgroundColor: background,
        appBarTheme: AppBarTheme(
            backgroundColor: background,
            foregroundColor: scheme.onSurface,
            elevation: 0),
        textTheme: const TextTheme(
            headlineMedium: TextStyle(fontWeight: FontWeight.w800),
            titleLarge: TextStyle(fontWeight: FontWeight.w700),
            titleMedium: TextStyle(fontWeight: FontWeight.w700),
            bodyLarge: TextStyle(height: 1.5),
            bodyMedium: TextStyle(height: 1.5)),
        cardTheme: CardThemeData(
            elevation: 0,
            color: scheme.surface,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: scheme.outlineVariant))),
        filledButtonTheme: FilledButtonThemeData(
            style: FilledButton.styleFrom(
                minimumSize: const Size(48, 52),
                padding:
                    const EdgeInsets.symmetric(horizontal: 22, vertical: 15),
                textStyle: const TextStyle(fontWeight: FontWeight.w700),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)))),
        inputDecorationTheme: InputDecorationTheme(
            filled: true,
            border:
                OutlineInputBorder(borderRadius: BorderRadius.circular(16))),
      );
}
