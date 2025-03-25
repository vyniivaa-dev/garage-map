<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MapController extends Controller
{
    // Display Login Form
    public function loginForm()
    {
        return view("garage.login");
    }

    // Handle Login
    public function login(Request $request)
    {
        $login_name = $request->input('login_name');
        $password = $request->input('password');

        $user = DB::table('user')->where('login_name', $login_name)->first();

        if ($user && password_verify($password, $user->password)) {
            if (strtolower($user->status) === 'active' && ($user->flag == 0 || $user->flag === false || $user->flag === null)) {
                Session::put('logged_in', true);
                Session::put('user_id', $user->user_id);
                Session::put('first_name', $user->first_name);
                return redirect()->route('map.view');
            } else {
                return redirect()->route('login')->with('error', 'Account is inactive or disabled');
            }
        }

        return redirect()->route('login')->with('error', 'Invalid login name or password');
    }

    // Display Map View
    public function map()
    {
        if (!Session::get('logged_in')) {
            return redirect()->route('login')->with('error', 'Please log in to access the map');
        }

        $garages = [];

        try {
            $rawGarages = DB::table('mou_info')->get();
            Log::info('Raw data from mou_info:', $rawGarages->toArray());

            $garages = $rawGarages->map(function ($row) {
                return [
                    "id" => $row->uid,
                    "name" => $row->name ?? '',
                    "phone" => $row->phone_number ?? '',
                    "org" => $row->org ?? '',
                    "visitDate" => $row->first_visit_time ?? '',
                    "fc" => $row->member_id ?? '',
                    "team" => $row->team ?? '',
                    "totalVehicle" => $row->total_vehicle_first_visit ?? '',
                    "state" => $row->mou_state ?? '',
                    "remark" => $row->remarks ?? '',
                    "lat" => floatval($row->latitude ?? 0),
                    "lon" => floatval($row->longitude ?? 0)
                ];
            })->toArray();

            Log::info('Processed garages data:', $garages);
        } catch (\Exception $e) {
            Log::error('Error fetching mou_info data: ' . $e->getMessage());
        }

        return view('garage.map', ['garages' => $garages]);
    }

    // Handle Logout
    public function logout()
    {
        Session::flush();
        return redirect()->route('login')->with('message', 'Logged out successfully');
    }

    // Save or Update Marker
    public function saveMarker(Request $request)
    {
        if (!Session::get('logged_in')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        try {
            $data = $request->validate([
                'lat' => 'required|numeric',
                'lng' => 'required|numeric',
                'name' => 'nullable|string|max:50',
                'org' => 'nullable|string|max:50',
                'phone' => 'nullable|string|max:20',
                'visitDate' => 'nullable|date',
                'fc' => 'nullable|string|max:50',
                'team' => 'nullable|string|max:50',
                'totalVehicle' => 'nullable|integer',
                'status' => 'nullable|string|max:50',
                'remark' => 'nullable|string',
            ]);

            $insertData = [
                'latitude' => $data['lat'],
                'longitude' => $data['lng'],
                'name' => $data['name'] ?? null,
                'org' => $data['org'] ?? null,
                'phone_number' => $data['phone'] ?? null,
                'first_visit_time' => $data['visitDate'] ?? null,
                'member_id' => $data['fc'] ?? null,
                'team' => $data['team'] ?? null,
                'total_vehicle_first_visit' => $data['totalVehicle'] ?? null,
                'mou_state' => $data['status'] ?? null,
                'remarks' => $data['remark'] ?? null,
                'create_time' => now(),
                'update_time' => now(),
            ];

            $id = $request->input('id');

            if ($id) {
                // Update existing record
                $updated = DB::table('mou_info')
                    ->where('uid', $id)
                    ->update(array_merge($insertData, ['update_time' => now()]));

                if ($updated === 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No record found with the provided ID'
                    ], 404);
                }
            } else {
                // Insert new record
                $id = DB::table('mou_info')->insertGetId($insertData);
            }

            return response()->json([
                'success' => true,
                'id' => $id,
                // 'message' => 'Marker saved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error saving marker: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}