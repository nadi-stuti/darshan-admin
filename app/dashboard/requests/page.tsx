'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'
import toast from 'react-hot-toast'

type UserRequest = Database['public']['Tables']['user_requests']['Row']
type SavedPlace = Database['public']['Tables']['saved_places']['Row']
type User = Database['public']['Tables']['users']['Row']
type Destination = Database['public']['Tables']['destinations']['Row']

export default function RequestsPage() {
  const [userRequests, setUserRequests] = useState<(UserRequest & { user: User })[]>([])
  const [savedPlaces, setSavedPlaces] = useState<(SavedPlace & { user: User; destination: Destination })[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'requests' | 'saved'>('requests')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch user requests with user data
      const { data: requests, error: requestsError } = await supabase
        .from('user_requests')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false })

      if (requestsError) throw requestsError

      // Fetch saved places with user and destination data
      const { data: saved, error: savedError } = await supabase
        .from('saved_places')
        .select(`
          *,
          user:users(*),
          destination:destinations(*)
        `)
        .order('id', { ascending: false })

      if (savedError) throw savedError

      setUserRequests(requests || [])
      setSavedPlaces(saved || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">User Data</h1>
          <p className="mt-2 text-sm text-gray-700">
            View user requests and saved places.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'requests' | 'saved')}
          >
            <option value="requests">User Requests</option>
            <option value="saved">Saved Places</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('requests')}
                className={`${
                  activeTab === 'requests'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              >
                User Requests
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`${
                  activeTab === 'saved'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              >
                Saved Places
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'requests' ? (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Request
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {userRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {request.user.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {request.request}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Destination
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          City
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Deity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {savedPlaces.map((saved) => (
                        <tr key={saved.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {saved.user.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {saved.destination.id}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {saved.destination.city}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {saved.destination.deity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 