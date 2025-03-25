@extends('layouts.app')

@section('title', 'SREGarageMapLocation')

@section('content')
    <!-- Notification Container -->
    <div id="notificationContainer" class="fixed top-2 right-2 z-[2000]"></div>

    <div id="map" class="h-screen w-screen absolute top-0 left-0"></div>

    <!-- Top-left controls -->
    <div class="absolute top-4 left-4 z-[1000] flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <button id="addMarkerBtn" title="Add Marker" class="p-2 bg-white border-none rounded-full shadow-md hover:bg-gray-100">
            <img src="https://maps.google.com/mapfiles/ms/icons/red-dot.png" alt="Add Marker" class="w-5 h-5">
        </button>
        <div class="relative bg-white border border-gray-200 rounded-full shadow-md p-1 search-container w-full sm:w-auto">
            <button id="searchBtn" title="Search" class="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer">
                <img src="https://cdn-icons-png.flaticon.com/512/149/149852.png" alt="Search" class="w-5 h-5">
            </button>
            <input type="text" id="searchInput" placeholder="Search all garage info" class="pl-10 pr-3 py-2 w-full sm:w-64 border-none rounded-full text-base focus:outline-none">
            <div id="searchDropdown" class="absolute top-full left-0 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-md hidden z-10"></div>
        </div>
    </div>
    <div class="absolute top-4 right-[115px] z-[1000]">
        <form action="{{ route('logout') }}" method="POST" class="flex">
            @csrf
            <button type="submit" class="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-sm sm:text-base">Logout</button>
        </form>
    </div>

    <!-- Bottom-right controls -->
    <div class="absolute bottom-5 right-3 z-[1000] bg-white border-2 border-gray-200 rounded shadow-md flex flex-col">
        <button id="currentLocationBtn" title="Show My Location" class="w-10 h-10 bg-white border-none border-t border-gray-200 text-2xl text-gray-600 hover:bg-gray-100">
            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Current Location" class="w-5 h-5 mx-auto">
        </button>
        <button id="zoomInBtn" title="Zoom In" class="w-10 h-10 bg-white border-none border-t border-gray-200 text-2xl text-gray-600 hover:bg-gray-100">+</button>
        <button id="zoomOutBtn" title="Zoom Out" class="w-10 h-10 bg-white border-none border-t border-gray-200 text-2xl text-gray-600 hover:bg-gray-100">-</button>
    </div>

    <!-- Edit Form -->
    <div id="editForm" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white p-3 sm:p-4 rounded-lg shadow-lg w-11/12 sm:w-full max-w-lg max-h-[90vh] overflow-y-auto hidden">
        <div class="flex justify-between items-center mb-5 border-b border-gray-200 pb-3">
            <h3 class="text-lg font-medium">Garage Information</h3>
            <button id="closeEditBtn" class="text-2xl text-gray-600 hover:text-gray-800">×</button>
        </div>
        <div class="space-y-2">
            <input type="hidden" id="edit-id">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <label for="edit-name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="edit-name" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="edit-phone" class="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" id="edit-phone" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <label for="edit-org" class="block text-sm font-medium text-gray-700">Org</label>
                    <select id="edit-org" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="SRE">SRE</option>
                        <option value="SREKP">SREKP</option>
                        <option value="SREKP1">SREKP1</option>
                    </select>
                </div>
                <div>
                    <label for="edit-visitDate" class="block text-sm font-medium text-gray-700">Visit Date</label>
                    <input type="date" id="edit-visitDate" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <label for="edit-totalVehicle" class="block text-sm font-medium text-gray-700">Total Vehicles</label>
                    <input type="number" id="edit-totalVehicle" min="0" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label for="edit-status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select id="edit-status" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Unconditioned</option>
                        <option value="-10">Blacklist</option>
                        <option value="-2">Terminated</option>
                        <option value="-1">Discontinued</option>
                        <option value="0">Not MOU</option>
                        <option value="1">In Talking</option>
                        <option value="10">MOU No Loan Yet</option>
                        <option value="50">MOU Paid Off</option>
                        <option value="100">MOU Active</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                    <label for="edit-team" class="block text-sm font-medium text-gray-700">Team</label>
                    <select id="edit-team" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Team A">Team A</option>
                        <option value="Team B">Team B</option>
                        <option value="Team C">Team C</option>
                        <option value="Team D">Team D</option>
                    </select>
                </div>
                <div>
                    <label for="edit-fc" class="block text-sm font-medium text-gray-700">FC</label>
                    <select id="edit-fc" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="FC001">FC001 - John Doe</option>
                        <option value="FC002">FC002 - Jane Smith</option>
                        <option value="FC003">FC003 - Mike Johnson</option>
                        <option value="FC004">FC004 - Sarah Williams</option>
                    </select>
                </div>
            </div>
            <div>
                <label for="edit-remark" class="block text-sm font-medium text-gray-700">Remark</label>
                <textarea id="edit-remark" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"></textarea>
            </div>
        </div>
        <div class="flex justify-end gap-3 mt-2 pt-2 border-t border-gray-200">
            <button id="cancelEditBtn" class="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancel</button>
            <button id="saveEditBtn" class="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
        </div>
    </div>
@endsection

@section('scripts')
    <script>
        window.garagesData = @json($garages ?? []);
        window.csrfToken = "{{ csrf_token() }}";
    </script>
    <script src="{{ asset('js/script.js') }}"></script>
@endsection