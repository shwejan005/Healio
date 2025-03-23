import { SignIn } from '@clerk/nextjs'
import React from 'react'

function page() {
  return (
    <div className='bg-[#d6f2c9] min-h-screen flex items-center justify-center'>
      <SignIn />
    </div>
  )
}

export default page