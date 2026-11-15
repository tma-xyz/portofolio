// ====== GANTI SEMUA ISI DI SINI DENGAN DATA KAMU ======
export const profile = {
  name: 'Radin Sakti Pratama',
  roles: ['Siswa RPL', 'Web Developer', 'Frontend Developer', 'Backend Developer'],
  intro:
  'Berawal dari rasa penasaran tentang cara kerja website, saya mulai belajar membangunnya, dari tampilan hingga database, agar tidak hanya bisa dilihat, tetapi juga bisa digunakan.',
   about:
  'Sebagai siswa kelas 11 jurusan Rekayasa Perangkat Lunak (RPL), saya fokus belajar membangun website dan aplikasi yang tidak hanya enak dilihat, tetapi juga berfungsi dengan baik dan dapat terhubung dengan database.',
  resume: 'https://drive.google.com/file/d/1olWRO6Q3yuScxe2FNg6ojC2OaGYOa4Ab/view?usp=sharing',
  github: 'https://github.com/tma-xyz',
  tiktok: 'tiktok.com/@slv_rayleigh',
  instagram: 'https://www.instagram.com/myb_sktii?obrf=MW1sdzhpOW9lczY0dg==',
  email: 'radinsp4@gmail.com',
  instagramHandle: '@myb_sktii',
  tiktokHandle: '@slv_rayleigh',
  githubHandle: '@tma-xyz',
  emailHandle: 'radinsp4@gmail.com',
  spotifyEmbed: 'https://open.spotify.com/embed/playlist/0ju1ygS6Sw7NtzMNaX76e0?utm_source=generator&theme=0',
}

export const education = [
  { title: 'SMK Negeri 1 Jenangan Ponorogo', sub: 'Rekayasa Perangkat Lunak (RPL) | Kelas 11', year: '2025 – Sekarang', letter: 'S' },
]

export const experience = [
  { title: 'Kelas Peminatan RPL', sub: 'Anggota', year: '2026 – Sekarang', letter: 'E' },
  { title: 'Mewakili Sekolah di Lomba STEMpreneur Tingkat Nasional', sub: 'Web Developer (Tim)', year: '2026', letter: 'P' },
  { title: 'Belajar Mandiri di W3Schools', sub: 'Pelajar', year: '2025 – Sekarang', letter: 'D' },
]

export const projects = [
  { title: 'Website Belajar Digital', image: 'public/images/edu.png', desc: 'Website yang digunakan untuk para pelajar untuk belajar secara online.', hue: 130, link: 'https://tma-xyz.github.io/EduSpace/' },
  { title: 'Website Toko Online', image: 'public/images/nfr.png', desc: 'Website yang digunakan untuk Menjual dan membeli produk secara online.', hue: 260, link: 'https://tma-xyz.github.io/Nufora/' },
  { title: 'Website SMK To PTN', image: 'public/images/sptn.png', desc: 'Website yang digunakan untuk mencatat seberapa konsisten dan sampai mana materi yang dipelajari oleh pelajar tersebut.', hue: 190, link: 'https://tma-xyz.github.io/study-myb/begitulah' },
]

export const certificates = [
  { title: 'Belajar Dasar UI/UX',image: 'public/images/sertif2.jpeg', issuer: 'Dicoding', hue: 30 },
  { title: 'Belajar Dasar Pemrograman Web',image: 'public/images/sertif.jpeg', issuer: 'Dicoding', hue: 30 },
]

export const techStack = [
  { name: 'React JS', badge: '⚛', color: '#FFC46B' },
  { name: 'Laravel', badge: 'L', color: '#FF5A1F' },
  { name: 'Node JS', badge: 'JS', color: '#FFB020' },
  { name: 'Vite', badge: '⚡', color: '#FF9A3D' },
  { name: 'Bootstrap', badge: 'B', color: '#E0701A' },
  { name: 'Supabase', badge: 'S', color: '#FFD27A' },
  { name: 'Material UI', badge: 'M', color: '#FF8A00' },
  { name: 'Vercel', badge: '▲', color: '#FFF5E6' },
  { name: 'Figma', badge: 'F', color: '#FF6A2B' },
]

// ====== TERJEMAHAN ENGLISH (dipakai saat tombol bahasa = EN) ======
// Teks utama di atas = Bahasa Indonesia. Di sini hanya field teks yang berbeda; urutan harus sama.

export const en = {
  profile: {
    roles: [
      'Software Engineering Student',
      'Web Developer',
      'Frontend Developer',
      'Backend Developer',
    ],
    intro:
      'It all started with my curiosity about how websites work. I began learning how to build them, from the user interface to the database, with the goal of creating websites that are not only visually appealing but also functional and useful.',
    about:
      'I am an 11th-grade Software Engineering (RPL) student with a strong interest in web and application development. I focus on building websites and applications that are not only visually appealing but also functional, reliable, and connected to databases.',
  },

  education: [
    {
      title: 'SMK Negeri 1 Jenangan Ponorogo',
      sub: 'Software Engineering (RPL) | Grade 11',
    },
  ],

  experience: [
    {
      title: 'Software Engineering Specialization Class',
      sub: 'Member',
    },
    {
      title: 'Represented My School at the National-Level STEMpreneur Competition',
      sub: 'Web Developer (Team)',
    },
    {
      title: 'Self-Learning on W3Schools',
      sub: 'Independent Learner',
    },
  ],

  projects: [
    {
      title: 'Digital Learning Website',
      desc: 'An online learning platform designed to help students access educational materials and study digitally.',
    },
    {
      title: 'Online Store Website',
      desc: 'An e-commerce website that allows users to browse, buy, and sell products online.',
    },
    {
      title: 'SMK to PTN Website',
      desc: 'A study-tracking website that helps students monitor their learning consistency and track their academic progress.',
    },
  ],

  certificates: [
    {
      title: 'UI/UX Design Fundamentals',
      issuer: 'Dicoding',
    },
    {
      title: 'Web Programming Fundamentals',
      issuer: 'Dicoding',
    },
  ],
}
