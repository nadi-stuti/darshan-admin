'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Constants, Database } from '@/database.types'
import toast from 'react-hot-toast'

type Destination = Database['public']['Tables']['destinations']['Row'] & {
  translations?: {
    name: string
    location: string
    language: string
  }[]
}
type DestinationTranslation = Database['public']['Tables']['destination_translations']['Row']
type DestinationImage = Database['public']['Tables']['destination_images']['Row']

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null)

  const [formData, setFormData] = useState({
    city: '',
    deity: 'Shiva' as Database['public']['Enums']['Deity'],
    latitude: 0,
    longitude: 0,
    live_feed: '',
    sampradaya: 'Vaishnava' as Database['public']['Enums']['Sampradaya'],
    translations: {
      en: { name: '', location: '', short_description: '', detailed_description: '' },
      hi: { name: '', location: '', short_description: '', detailed_description: '' },
      kn: { name: '', location: '', short_description: '', detailed_description: '' },
      ml: { name: '', location: '', short_description: '', detailed_description: '' },
      ta: { name: '', location: '', short_description: '', detailed_description: '' },
    },
    images: [] as string[],
  })

  useEffect(() => {
    fetchDestinations()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingDestination) {
        // Update existing destination
        const { error: destError } = await supabase
          .from('destinations')
          .update({
            city: formData.city,
            deity: formData.deity,
            latitude: formData.latitude,
            longitude: formData.longitude,
            live_feed: formData.live_feed,
            sampradaya: formData.sampradaya,
          })
          .eq('id', editingDestination.id)

        if (destError) throw destError

        // Update translations
        for (const [lang, translation] of Object.entries(formData.translations)) {
          const { error: transError } = await supabase
            .from('destination_translations')
            .update({
              name: translation.name,
              location: translation.location,
              short_description: translation.short_description,
              detailed_description: translation.detailed_description,
            })
            .eq('destination_id', editingDestination.id)
            .eq('language', lang)

          if (transError) throw transError
        }

        toast.success('Destination updated successfully!')
      } else {
        // Create new destination
        const { data: newDest, error: destError } = await supabase
          .from('destinations')
          .insert({
            city: formData.city,
            deity: formData.deity,
            latitude: formData.latitude,
            longitude: formData.longitude,
            live_feed: formData.live_feed,
            sampradaya: formData.sampradaya,
          })
          .select()
          .single()

        if (destError) throw destError

        // Create translations
        for (const [lang, translation] of Object.entries(formData.translations)) {
          const { error: transError } = await supabase
            .from('destination_translations')
            .insert({
              destination_id: newDest.id,
              language: lang as Database['public']['Enums']['Language'],
              name: translation.name,
              location: translation.location,
              short_description: translation.short_description,
              detailed_description: translation.detailed_description,
            })

          if (transError) throw transError
        }

        // Create images
        for (const imageUrl of formData.images) {
          const { error: imgError } = await supabase
            .from('destination_images')
            .insert({
              destination_id: newDest.id,
              hero_image: imageUrl,
            })

          if (imgError) throw imgError
        }

        toast.success('Destination created successfully!')
      }

      setShowForm(false)
      setEditingDestination(null)
      setFormData({
        city: '',
        deity: 'Shiva',
        latitude: 0,
        longitude: 0,
        live_feed: '',
        sampradaya: 'Vaishnava',
        translations: {
          en: { name: '', location: '', short_description: '', detailed_description: '' },
          hi: { name: '', location: '', short_description: '', detailed_description: '' },
          kn: { name: '', location: '', short_description: '', detailed_description: '' },
          ml: { name: '', location: '', short_description: '', detailed_description: '' },
          ta: { name: '', location: '', short_description: '', detailed_description: '' },
        },
        images: [],
      })
      fetchDestinations()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (destination: Destination) => {
    setEditingDestination(destination)
    setFormData({
      city: destination.city,
      deity: destination.deity,
      latitude: destination.latitude,
      longitude: destination.longitude,
      live_feed: destination.live_feed,
      sampradaya: destination.sampradaya,
      translations: {
        en: { name: '', location: '', short_description: '', detailed_description: '' },
        hi: { name: '', location: '', short_description: '', detailed_description: '' },
        kn: { name: '', location: '', short_description: '', detailed_description: '' },
        ml: { name: '', location: '', short_description: '', detailed_description: '' },
        ta: { name: '', location: '', short_description: '', detailed_description: '' },
      },
      images: [],
    })

    // Fetch translations
    const { data: translations } = await supabase
      .from('destination_translations')
      .select('*')
      .eq('destination_id', destination.id)

    if (translations) {
      const newTranslations = { ...formData.translations }
      translations.forEach((trans: DestinationTranslation) => {
        newTranslations[trans.language as keyof typeof newTranslations] = {
          name: trans.name,
          location: trans.location,
          short_description: trans.short_description,
          detailed_description: trans.detailed_description,
        }
      })
      setFormData((prev) => ({ ...prev, translations: newTranslations }))
    }

    // Fetch images
    const { data: images } = await supabase
      .from('destination_images')
      .select('hero_image')
      .eq('destination_id', destination.id)

    if (images) {
      setFormData((prev) => ({
        ...prev,
        images: images.map((img) => img.hero_image),
      }))
    }

    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return

    try {
      const { error } = await supabase.from('destinations').delete().eq('id', id)
      if (error) throw error
      toast.success('Destination deleted successfully!')
      fetchDestinations()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Destinations</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all destinations in the system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setShowForm(true)
              setEditingDestination(null)
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
          >
            Add destination
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingDestination ? 'Edit Destination' : 'Add New Destination'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="deity" className="block text-sm font-medium text-gray-700 mb-2">
                    Deity
                  </label>
                  <select
                    id="deity"
                    name="deity"
                    required
                    value={formData.deity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deity: e.target.value as Database['public']['Enums']['Deity'],
                      }))
                    }
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  >
                    {Object.values(Constants.public.Enums.Deity).map((deity) => (
                      <option key={deity} value={deity}>
                        {deity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    id="latitude"
                    required
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latitude: parseFloat(e.target.value),
                      }))
                    }
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    id="longitude"
                    required
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        longitude: parseFloat(e.target.value),
                      }))
                    }
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="sampradaya" className="block text-sm font-medium text-gray-700 mb-2">
                    Sampradaya
                  </label>
                  <select
                    id="sampradaya"
                    name="sampradaya"
                    required
                    value={formData.sampradaya}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sampradaya: e.target.value as Database['public']['Enums']['Sampradaya'],
                      }))
                    }
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  >
                    {Object.values(Constants.public.Enums.Sampradaya).map((sampradaya) => (
                      <option key={sampradaya} value={sampradaya}>
                        {sampradaya}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="live_feed" className="block text-sm font-medium text-gray-700 mb-2">
                    Live Feed URL
                  </label>
                  <input
                    type="url"
                    name="live_feed"
                    id="live_feed"
                    required
                    value={formData.live_feed}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, live_feed: e.target.value }))
                    }
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
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
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label
                          htmlFor={`${lang}-location`}
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          name={`${lang}-location`}
                          id={`${lang}-location`}
                          required
                          value={translation.location}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              translations: {
                                ...prev.translations,
                                [lang]: { ...translation, location: e.target.value },
                              },
                            }))
                          }
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label
                          htmlFor={`${lang}-short-description`}
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Short Description
                        </label>
                        <textarea
                          name={`${lang}-short-description`}
                          id={`${lang}-short-description`}
                          required
                          rows={3}
                          value={translation.short_description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              translations: {
                                ...prev.translations,
                                [lang]: { ...translation, short_description: e.target.value },
                              },
                            }))
                          }
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-6">
                        <label
                          htmlFor={`${lang}-detailed-description`}
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Detailed Description
                        </label>
                        <textarea
                          name={`${lang}-detailed-description`}
                          id={`${lang}-detailed-description`}
                          required
                          rows={5}
                          value={translation.detailed_description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              translations: {
                                ...prev.translations,
                                [lang]: { ...translation, detailed_description: e.target.value },
                              },
                            }))
                          }
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Images</h4>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {formData.images.map((image, index) => (
                    <div key={index} className="sm:col-span-2">
                      <div className="relative group">
                        <img
                          src={image}
                          alt={`Destination image ${index + 1}`}
                          className="h-32 w-full object-cover rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }))
                          }
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <span className="text-white text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
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
                          images: [...prev.images, e.target.value],
                        }))
                      }
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingDestination(null)
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
                  {loading ? 'Saving...' : editingDestination ? 'Update' : 'Create'}
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
                      City
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Deity
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Sampradaya
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
                  {destinations.map((destination) => {
                    const englishTranslation = destination.translations?.find(
                      (t) => t.language === 'en'
                    )
                    return (
                      <tr key={destination.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {englishTranslation?.name || destination.city}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {destination.city}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {destination.deity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {destination.sampradaya}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleEdit(destination)}
                            className="text-primary hover:text-primary/90 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(destination.id)}
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