'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { type Database } from '@/database.types'
import Link from 'next/link'

type Destination = Database['public']['Tables']['destinations']['Row']
type Event = Database['public']['Tables']['events']['Row']
type UserRequest = Database['public']['Tables']['user_requests']['Row']

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDestinations: 0,
    totalEvents: 0,
    totalRequests: 0,
    recentDestinations: [] as Destination[],
    upcomingEvents: [] as Event[],
    recentRequests: [] as UserRequest[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch total destinations
      const { count: destinationsCount } = await supabase
        .from('destinations')
        .select('*', { count: 'exact', head: true })

      // Fetch total events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })

      // Fetch total requests
      const { count: requestsCount } = await supabase
        .from('user_requests')
        .select('*', { count: 'exact', head: true })

      // Fetch recent destinations
      const { data: recentDestinations } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch upcoming events
      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5)

      // Fetch recent requests
      const { data: recentRequests } = await supabase
        .from('user_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalDestinations: destinationsCount || 0,
        totalEvents: eventsCount || 0,
        totalRequests: requestsCount || 0,
        recentDestinations: recentDestinations || [],
        upcomingEvents: upcomingEvents || [],
        recentRequests: recentRequests || [],
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Destinations</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalDestinations}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/destinations" className="font-medium text-primary hover:text-primary/90">
                View all destinations
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalEvents}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/events" className="font-medium text-primary hover:text-primary/90">
                View all events
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/requests" className="font-medium text-primary hover:text-primary/90">
                View all requests
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Destinations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Destinations</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {stats.recentDestinations.map((destination) => (
                <li key={destination.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate">{destination.city}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {destination.deity}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Events</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {stats.upcomingEvents.map((event) => (
                <li key={event.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary truncate">
                      {event.date ? new Date(event.date).toLocaleDateString() : 'No date set'}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {event.start_time}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 