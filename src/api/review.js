import { request } from './http'

export const reviewService = {
  create(payload) {
    return request('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  listPublic(slug) {
    return request(`/public/businesses/${slug}/reviews`, { method: 'GET' })
  },

  listBusinessReviews({ page = 0, size = 20, sort = 'createdAt,desc' } = {}) {
    const params = new URLSearchParams({ page, size, sort })
    return request(`/business/reviews?${params.toString()}`, { method: 'GET' })
  },

  updateVisibility(reviewId, payload) {
    return request(`/business/reviews/${reviewId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
