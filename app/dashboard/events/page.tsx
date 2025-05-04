'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'
import toast from 'react-hot-toast'
import { eventSchema, type EventFormData } from '@/lib/validations'

type Event = Database['public']['Tables']['events']['Row'] & {
  translations?: {
    name: string
    description: string
    language: Database['public']['Enums']['Language']
  }[]
}
type Destination = Database['public']['Tables']['destinations']['Row'] & {
  translations?: {
    name: string
    language: string
  }[]
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<EventFormData>({
    destination_id: '',
    start_time: '',
    end_time: '',
    date: '',
    daily: false,
    isPopular: false,
    event_image: '',
    translations: {
      en: { name: '', description: '' },
      hi: { name: '', description: '' },
      kn: { name: '', description: '' },
      ml: { name: '', description: '' },
      ta: { name: '', description: '' },
    },
  })

  useEffect(() => {
    fetchEvents()
    fetchDestinations()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          translations:event_translations(*)
        `)
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select(`
          *,
          translations:destination_translations(*)
        `)
        .order('city')

      if (error) throw error
      setDestinations(data || [])
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormErrors({})

    try {
      // Validate form data
      const validatedData = eventSchema.parse(formData)
      
      if (editingEvent) {
        // Update existing event
        const { error: eventError } = await supabase
          .from('events')
          .update({
            destination_id: validatedData.destination_id,
            start_time: validatedData.start_time,
            end_time: validatedData.end_time,
            date: validatedData.date || null,
            daily: validatedData.daily,
            isPopular: validatedData.isPopular,
            event_image: validatedData.event_image,
          })
          .eq('id', editingEvent.id)

        if (eventError) throw eventError

        // Update translations
        for (const [lang, translation] of Object.entries(validatedData.translations)) {
          const { error: transError } = await supabase
            .from('event_translations')
            .update({
              name: translation.name,
              description: translation.description,
            })
            .eq('event_id', editingEvent.id)
            .eq('language', lang)

          if (transError) throw transError
        }

        toast.success('Event updated successfully!')
      } else {
        // Create new event
        const { data: newEvent, error: eventError } = await supabase
          .from('events')
          .insert({
            destination_id: validatedData.destination_id,
            start_time: validatedData.start_time,
            end_time: validatedData.end_time,
            date: validatedData.date || null,
            daily: validatedData.daily,
            isPopular: validatedData.isPopular,
            event_image: validatedData.event_image,
          })
          .select()
          .single()

        if (eventError) throw eventError

        // Create translations
        for (const [lang, translation] of Object.entries(validatedData.translations)) {
          const { error: transError } = await supabase
            .from('event_translations')
            .insert({
              event_id: newEvent.id,
              language: lang as Database['public']['Enums']['Language'],
              name: translation.name,
              description: translation.description,
            })

          if (transError) throw transError
        }

        toast.success('Event created successfully!')
      }

      setShowForm(false)
      setEditingEvent(null)
      setFormData({
        destination_id: '',
        start_time: '',
        end_time: '',
        date: '',
        daily: false,
        isPopular: false,
        event_image: '',
        translations: {
          en: { name: '', description: '' },
          hi: { name: '', description: '' },
          kn: { name: '', description: '' },
          ml: { name: '', description: '' },
          ta: { name: '', description: '' },
        },
      })
      fetchEvents()
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const errors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        setFormErrors(errors)
        toast.error('Please fill in all required fields correctly')
      } else {
        toast.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (event: Event) => {
    setEditingEvent(event)
    setFormData({
      destination_id: event.destination_id,
      start_time: event.start_time,
      end_time: event.end_time,
      date: event.date || '',
      daily: event.daily || false,
      isPopular: event.isPopular || false,
      event_image: event.event_image || '',
      translations: {
        en: { name: '', description: '' },
        hi: { name: '', description: '' },
        kn: { name: '', description: '' },
        ml: { name: '', description: '' },
        ta: { name: '', description: '' },
      },
    })

    // Fetch translations
    const { data: translations } = await supabase
      .from('event_translations')
      .select('*')
      .eq('event_id', event.id)

    if (translations) {
      const newTranslations = { ...formData.translations }
      translations.forEach((trans) => {
        newTranslations[trans.language as keyof typeof newTranslations] = {
          name: trans.name,
          description: trans.description,
        }
      })
      setFormData((prev) => ({ ...prev, translations: newTranslations }))
    }

    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      toast.success('Event deleted successfully!')
      fetchEvents()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all events in the system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setShowForm(true)
              setEditingEvent(null)
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
          >
            Add event
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="destination"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Destination
                  </label>
                  <select
                    id="destination"
                    name="destination"
                    required
                    value={formData.destination_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, destination_id: e.target.value }))
                    }
                    className={`block w-full rounded-lg border ${formErrors['destination_id'] ? 'border-red-300' : 'border-gray-300'} px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
                  >
                    <option value="">Select a destination</option>
                    {destinations.map((destination) => {
                      const englishTranslation = destination.translations?.find(
                        (t) => t.language === 'en'
                      )
                      return (
                        <option key={destination.id} value={destination.id}>
                          {englishTranslation?.name || destination.city}
                        </option>
                      )
                    })}
                  </select>
                  {formErrors['destination_id'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['destination_id']}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className={`block w-full rounded-lg border ${formErrors['date'] ? 'border-red-300' : 'border-gray-300'} px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
                  />
                  {formErrors['date'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['date']}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="start_time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    id="start_time"
                    required
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, start_time: e.target.value }))
                    }
                    className={`block w-full rounded-lg border ${formErrors['start_time'] ? 'border-red-300' : 'border-gray-300'} px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
                  />
                  {formErrors['start_time'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['start_time']}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    id="end_time"
                    required
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                    }
                    className={`block w-full rounded-lg border ${formErrors['end_time'] ? 'border-red-300' : 'border-gray-300'} px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
                  />
                  {formErrors['end_time'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['end_time']}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <div className="flex items-center h-12">
                    <input
                      type="checkbox"
                      name="daily"
                      id="daily"
                      checked={formData.daily}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, daily: e.target.checked }))
                      }
                      className={`h-5 w-5 rounded text-primary focus:ring-primary/20 transition-colors ${formErrors['daily'] ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    <label htmlFor="daily" className="ml-3 block text-sm font-medium text-gray-900">
                      Daily Event
                    </label>
                  </div>
                  {formErrors['daily'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['daily']}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <div className="flex items-center h-12">
                    <input
                      type="checkbox"
                      name="isPopular"
                      id="isPopular"
                      checked={formData.isPopular}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isPopular: e.target.checked }))
                      }
                      className={`h-5 w-5 rounded text-primary focus:ring-primary/20 transition-colors ${formErrors['isPopular'] ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    <label htmlFor="isPopular" className="ml-3 block text-sm font-medium text-gray-900">
                      Popular Event
                    </label>
                  </div>
                  {formErrors['isPopular'] && (
                    <p className="mt-1 text-sm text-red-600">{formErrors['isPopular']}</p>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-lg font-medium text-gray-900">Translations</h4>
                {Object.entries(formData.translations).map(([lang, translation]) => (
                  <div key={lang} className="bg-gray-50 rounded-lg p-6 space-y-6">
                    <h5 className="text-base font-medium text-gray-900 capitalize">{lang}</h5>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor={`${lang}-name`}
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name={`${lang}-name`}
                          id={`${lang}-name`}
                          required
                          value={translation.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              translations: {
                                ...prev.translations,
                                [lang]: { ...translation, name: e.target.value },
                              },
                            }))
                          }
                          className={`block w-full rounded-lg border ${formErrors[`${lang}-name`] ? 'border-red-300' : 'border-gray-300'} px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
                        />
                        {formErrors[`${lang}-name`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`${lang}-name`]}</p>
                        )}
                      </div>
                      <div className="sm:col-span-6">
                        <label
                          htmlFor={`${lang}-description`}
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Description
                        </label>
                        <textarea
                          name={`${lang}-description`}
                          id={`${lang}-description`}
                          required
                          rows={4}
                          value={translation.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              translations: {
                                ...prev.translations,
                                [lang]: { ...translation, description: e.target.value },
                              },
                            }))
                          }
                          className={`block w-full rounded-lg border ${formErrors[`${lang}-description`] ? 'border-red-300' : 'border-gray-300'} px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
                        />
                        {formErrors[`${lang}-description`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`${lang}-description`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Images</h4>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {formData.event_image && (
                    <div key={formData.event_image} className="sm:col-span-2">
                      <div className="relative group">
                        <img
                          src={formData.event_image}
                          className="h-32 w-full object-cover rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, event_image: '' }))}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <span className="text-white text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="new-image"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Add Image URL
                    </label>
                    <input
                      type="url"
                      name="new-image"
                      id="new-image"
                      value=""
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          event_image: e.target.value,
                        }))
                      }
                      className={`block w-full rounded-lg border ${formErrors['new-image'] ? 'border-red-300' : 'border-gray-300'} px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
                    />
                    {formErrors['new-image'] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors['new-image']}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingEvent(null)
                  }}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
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
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Daily
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Popular
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {events.map((event) => {
                    const englishTranslation = event.translations?.find(
                      (t) => t.language === 'en'
                    )
                    const destination = destinations.find((d) => d.id === event.destination_id)
                    const destinationEnglishTranslation = destination?.translations?.find(
                      (t) => t.language === 'en'
                    )
                    return (
                      <tr key={event.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {englishTranslation?.name || 'Unnamed Event'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {destinationEnglishTranslation?.name || destination?.city || 'Unknown Destination'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {event.date ? new Date(event.date).toLocaleDateString() : 'No date set'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {event.start_time} - {event.end_time}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {event.daily ? 'Yes' : 'No'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {event.isPopular ? 'Yes' : 'No'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleEdit(event)}
                            className="text-primary hover:text-primary/90 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 