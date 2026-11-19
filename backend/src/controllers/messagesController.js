import { supabase } from '../database/db.js'

export const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body
    const errors = {}

    if (!name || !name.trim()) {
      errors.name = ['Nama wajib diisi']
    } else if (name.trim().length > 100) {
      errors.name = ['Nama maksimal 100 karakter']
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !email.trim()) {
      errors.email = ['Email wajib diisi']
    } else if (!emailRegex.test(email.trim())) {
      errors.email = ['Format email tidak valid']
    } else if (email.trim().length > 150) {
      errors.email = ['Email maksimal 150 karakter']
    }

    if (!message || !message.trim()) {
      errors.message = ['Pesan wajib diisi']
    } else if (message.trim().length > 2000) {
      errors.message = ['Pesan maksimal 2000 karakter']
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        message: 'The given data was invalid.',
        errors,
      })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(503).json({
        message: 'Database Supabase belum dikonfigurasi di backend/.env',
      })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase Error:', error)
      return res.status(500).json({ message: 'Gagal menyimpan pesan ke database Supabase' })
    }

    return res.status(201).json(data)
  } catch (err) {
    console.error('createMessage error:', err)
    return res.status(500).json({ message: 'Gagal mengirim pesan' })
  }
}
