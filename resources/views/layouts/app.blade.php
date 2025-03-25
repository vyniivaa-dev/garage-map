<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name', 'Laravel'))</title>
    <!-- Favicon -->
    {{-- <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}"> --}}
    {{-- <link rel="icon" type="image/png" href="{{ asset('red.png') }}"> --}}
    <!-- Leaflet CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
    <!-- Vite for app.css and app.js -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <!-- Yield additional styles -->
    @yield('styles')
</head>
<body class="font-sans">
    @yield('content')
    <!-- Yield additional scripts -->
    @yield('scripts')
</body>
</html>