@extends('layouts.app')

@section('title', 'Login')

@section('content')
    <div class="bg-gray-100 min-h-screen flex justify-center items-center p-2 sm:p-4 lg:p-6">
        <div class="w-full max-w-md p-4 sm:p-6 lg:p-8 bg-white bg-opacity-95 rounded-lg shadow-md relative overflow-hidden">
            <!-- Pseudo-element simulation -->
            <div class="absolute inset-0 bg-yellow-200 opacity-30 z-[-1]"></div>

            <h2 class="text-gray-700 text-center mb-4 sm:mb-6 uppercase tracking-wide text-xl sm:text-2xl lg:text-3xl">Login</h2>
            
            <form method="POST" action="{{ url('/login') }}">
                @csrf
                <div class="mb-3 sm:mb-5 relative">
                    <label for="login_name" class="block mb-1 text-gray-600 font-medium text-sm sm:text-base">Username:</label>
                    <input type="text" id="login_name" name="login_name" value="{{ old('login_name') }}" required 
                           class="w-full p-2 sm:p-3 border {{ $errors->has('login_name') ? 'border-2 border-red-500' : 'border-gray-300' }} rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    @error('login_name')
                        <div class="mt-3 sm:mt-4 text-red-600 bg-white bg-opacity-90 p-2 sm:p-3 rounded-md text-sm sm:text-base">{{ $message }}</div>
                    @enderror
                </div>
                <div class="mb-3 sm:mb-5 relative">
                    <label for="password" class="block mb-1 text-gray-600 font-medium text-sm sm:text-base">Password:</label>
                    <input type="password" id="password" name="password" required 
                           class="w-full p-2 sm:p-3 border {{ $errors->has('password') ? 'border-2 border-red-500' : 'border-gray-300' }} rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    @error('password')
                        <div class="mt-3 sm:mt-4 text-red-600 bg-white bg-opacity-90 p-2 sm:p-3 rounded-md text-sm sm:text-base">{{ $message }}</div>
                    @enderror
                </div>
                <div class="text-center mt-4 sm:mt-6">
                    <button type="submit" 
                            class="w-full py-3 sm:py-4 px-4 sm:px-6 bg-blue-600 text-white rounded-md cursor-pointer transition duration-300 ease-in-out text-sm sm:text-base hover:bg-blue-700 hover:-translate-y-0.5">
                        Login
                    </button>
                </div>
            </form>
            
            @if (session('success'))
                <div class="mt-3 sm:mt-4 text-green-600 bg-white bg-opacity-90 p-2 sm:p-3 rounded-md text-center text-sm sm:text-base font-bold">
                    {{ session('success') }}
                </div>
            @endif
        </div>
    </div>
@endsection