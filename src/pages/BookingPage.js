import React from 'react'
import { useLocation } from 'react-router-dom'
import BookingForm from '../components/booking/BookingForm'

const BookingPage = () => {
  const location = useLocation()
  const bookingData = location.state?.bookingData

  return (
    <main>
      <BookingForm bookingData={bookingData} />
    </main>
  )
}

export default BookingPage
