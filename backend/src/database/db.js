import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('\n⚠️  [Supabase] Peringatan: SUPABASE_URL atau SUPABASE_KEY belum diisi di backend/.env!')
  console.warn('   Silakan isi kredensial Supabase Anda di file backend/.env agar pesan kontak dapat tersimpan.\n')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')
export default supabase
