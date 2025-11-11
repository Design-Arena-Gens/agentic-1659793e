import { NextRequest, NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AppointmentData {
  name?: string
  age?: string
  problem?: string
  time?: string
  completed: boolean
}

function extractAppointmentInfo(messages: Message[]): AppointmentData {
  const data: AppointmentData = { completed: false }

  const conversationText = messages.map(m => m.content).join(' ').toLowerCase()

  // Check if appointment is completed
  if (conversationText.includes('appointment confirm') || conversationText.includes('confirm kar diya')) {
    data.completed = true
  }

  return data
}

function generateResponse(messages: Message[]): string {
  const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || ''
  const conversationText = messages.map(m => m.content).join(' ').toLowerCase()

  const appointmentData = extractAppointmentInfo(messages)

  // Greeting responses
  if (lastUserMessage.includes('thik') || lastUserMessage.includes('ठीक') ||
      lastUserMessage.includes('accha') || lastUserMessage.includes('अच्छा') ||
      lastUserMessage.includes('badhiya') || lastUserMessage.includes('hello') ||
      lastUserMessage.includes('hi')) {
    if (!conversationText.includes('naam') && messages.length <= 3) {
      return 'Bahut achha ji! Main aapki appointment book karne me madad karungi. Kripya apna naam bataiye ji?'
    }
  }

  // Name collection
  if (!conversationText.includes('umar') && !conversationText.includes('age') &&
      messages.filter(m => m.role === 'user').length <= 2) {
    // User likely gave their name
    return `Dhanyavaad ji! Aapki umar kya hai ji?`
  }

  // Age collection
  if ((conversationText.includes('umar') || conversationText.includes('saal') ||
       /\d+/.test(lastUserMessage)) && !conversationText.includes('kya problem')) {
    if (!conversationText.includes('problem') && messages.filter(m => m.role === 'user').length <= 3) {
      return 'Main note kar leti hoon ji. Aapko kya problem hai ji? Jaise bal girna, skin problem, dard, ya koi aur samasya?'
    }
  }

  // Problem collection
  if (!conversationText.includes('kab aa') && messages.filter(m => m.role === 'user').length >= 3 &&
      (lastUserMessage.includes('bal') || lastUserMessage.includes('hair') ||
       lastUserMessage.includes('skin') || lastUserMessage.includes('dard') ||
       lastUserMessage.includes('problem') || lastUserMessage.includes('samasya'))) {
    return 'Samajh gayi ji, main note kar leti hoon. Aap kab appointment lena chahenge ji? Subah 10 baje se shaam 6 baje tak clinic khuli rehti hai.'
  }

  // Time collection and confirmation
  if ((lastUserMessage.includes('baje') || lastUserMessage.includes('subah') ||
       lastUserMessage.includes('shaam') || lastUserMessage.includes('kal') ||
       lastUserMessage.includes('aaj') || /\d+/.test(lastUserMessage)) &&
      !appointmentData.completed) {
    return 'Perfect ji! Aapka appointment confirm kar diya gaya hai. Clinic ka address aur timing ka detail aapko WhatsApp/SMS me bhej diya jayega. Kya aur kuch janna chahenge ji?'
  }

  // Clinic info questions
  if (lastUserMessage.includes('address') || lastUserMessage.includes('kaha') || lastUserMessage.includes('कहाँ')) {
    return 'Ji, clinic ka address hai: Lumivian Clinic, Main Market, Medical Complex, 2nd Floor. Exact location WhatsApp pe bhej diya jayega ji.'
  }

  if (lastUserMessage.includes('timing') || lastUserMessage.includes('time') || lastUserMessage.includes('khuli')) {
    return 'Clinic subah 10 baje se shaam 6 baje tak khuli rehti hai ji, Monday se Saturday. Sunday ko chutti rehti hai.'
  }

  if (lastUserMessage.includes('doctor') || lastUserMessage.includes('daktar')) {
    return 'Hamare clinic me Dr. Rajesh Sharma ji hain, jo 15 saal se practice kar rahe hain. Wo hair, skin aur general health ke specialist hain ji.'
  }

  if (lastUserMessage.includes('fees') || lastUserMessage.includes('charge') || lastUserMessage.includes('kitna')) {
    return 'Consultation fees 500 rupaye hai ji. First visit me basic check-up free hai.'
  }

  // Thank you / goodbye
  if (lastUserMessage.includes('thank') || lastUserMessage.includes('dhanyavad') ||
      lastUserMessage.includes('धन्यवाद') || lastUserMessage.includes('bye') ||
      lastUserMessage.includes('nahi') && conversationText.includes('aur kuch')) {
    return 'Aapka swagat hai ji! Appointment ke liye dhanyavaad. Clinic me milte hain. Namaste ji!'
  }

  // Default response
  return 'Ji kripya phir se bataiye? Main aapki baat samajh nahi payi. Aap apna naam, umar, ya problem ke baare me bata sakte hain ji.'
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const response = generateResponse(messages)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
