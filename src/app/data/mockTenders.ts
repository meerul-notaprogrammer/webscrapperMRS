export type TenderStatus = 'available' | 'accepted' | 'onhold' | 'removed';

export interface Tender {
  id: string;
  quotationNumber: string;
  category: {
    code: string;
    name: string;
  };
  summary: string;
  description: string;
  amount: number;
  ministry: {
    name: string;
    department: string;
    contact: string;
    phone: string;
    location: string;
  };
  dates: {
    published: Date;
    closing: Date;
    briefing?: Date;
  };
  tags: string[];
  status: TenderStatus;
  isUrgent: boolean;
  documents: {
    name: string;
    size: string;
    url: string;
  }[];
  budgetCode?: string;
  paymentTerms?: string;
  notes?: string;
  fieldCodes?: string[];
  contactDetails?: {
    name: string;
    phone: string;
    email?: string;
  }[];
  activityHistory: {
    action: string;
    timestamp: Date;
    user?: string;
  }[];
}

// Helper function to calculate days remaining
export const getDaysRemaining = (closingDate: Date): number => {
  const now = new Date();
  const diff = closingDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Helper function to check if tender is urgent (< 7 days)
export const isUrgent = (closingDate: Date): boolean => {
  return getDaysRemaining(closingDate) < 7;
};

// Mock tender data
export const mockTenders: Tender[] = [
  {
    id: '1',
    quotationNumber: 'Q2024001',
    category: {
      code: '020301',
      name: 'Perabot Pejabat',
    },
    summary: 'Pembekalan dan penghantaran komputer, printer, projektor dan perisian Microsoft Office untuk kegunaan pejabat di seluruh Putrajaya dan cawangan negeri',
    description: `Pembekalan dan penghantaran komputer, printer, projektor dan perisian Microsoft Office untuk kegunaan pejabat di seluruh Putrajaya dan cawangan negeri.

Skop Kerja:
1. Membekal 50 unit komputer desktop (Intel Core i7, 16GB RAM, 512GB SSD)
2. Membekal 25 unit printer laser multifungsi
3. Membekal 10 unit projektor LCD (Full HD, 3000 lumens)
4. Membekal 75 lesen Microsoft Office Professional Plus
5. Penghantaran, pemasangan dan latihan kepada pengguna
6. Tempoh jaminan 3 tahun untuk kesemua peralatan

Kelayakan Pembekal:
- Berdaftar dengan MOF Malaysia
- Mempunyai pengalaman sekurang-kurangnya 3 tahun dalam pembekalan peralatan IT
- Sijil pengedar sah Microsoft
- Kemampuan kewangan yang kukuh`,
    amount: 45000,
    ministry: {
      name: 'Kementerian Kewangan',
      department: 'Bahagian Perolehan',
      contact: 'procurement@treasury.gov.my',
      phone: '+603-8000-8000',
      location: 'Putrajaya',
    },
    dates: {
      published: new Date('2026-01-01'),
      closing: new Date('2026-01-15'),
      briefing: new Date('2026-01-10T10:00:00'),
    },
    tags: ['Computer', 'Software', 'Hardware', 'Office Equipment', 'Microsoft'],
    status: 'available',
    isUrgent: true,
    documents: [
      { name: 'Tender Document.pdf', size: '2.4 MB', url: '#' },
      { name: 'Technical Specs.xlsx', size: '156 KB', url: '#' },
      { name: 'Terms & Conditions.pdf', size: '890 KB', url: '#' },
    ],
    budgetCode: 'A12345',
    paymentTerms: 'Net 30',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T14:00:00') },
      { action: 'Status changed to Available', timestamp: new Date('2026-01-07T14:00:00') },
    ],
  },
  {
    id: '2',
    quotationNumber: 'Q2024002',
    category: {
      code: '020601',
      name: 'Bekalan Pejabat',
    },
    summary: 'Bekalan alat tulis, kertas, pen dan fail untuk pejabat selama 12 bulan',
    description: `Pembekalan alat tulis dan keperluan pejabat untuk tempoh 12 bulan.

Senarai Barang:
1. Kertas A4 80gsm - 500 rim
2. Pen ballpoint (hitam, biru, merah) - 1000 batang
3. Pensil 2B - 500 batang
4. Fail manila - 1000 unit
5. Fail spring - 500 unit
6. Stapler dan isi - 100 set
7. Clip kertas pelbagai saiz - 200 kotak
8. Pelekat nota (sticky notes) - 500 pad

Syarat Pembekalan:
- Penghantaran bulanan mengikut jadual
- Penghantaran percuma ke lokasi yang ditetapkan
- Gantian barang rosak dalam masa 48 jam
- Jaminan kualiti produk`,
    amount: 12500,
    ministry: {
      name: 'Kementerian Kesihatan Malaysia',
      department: 'Bahagian Pentadbiran',
      contact: 'admin@moh.gov.my',
      phone: '+603-8883-0000',
      location: 'Putrajaya',
    },
    dates: {
      published: new Date('2026-01-05'),
      closing: new Date('2026-01-28'),
    },
    tags: ['Stationery', 'Office Supplies', 'Alat Tulis'],
    status: 'available',
    isUrgent: false,
    documents: [
      { name: 'Tender Document.pdf', size: '1.2 MB', url: '#' },
      { name: 'Item List.xlsx', size: '85 KB', url: '#' },
    ],
    budgetCode: 'B23456',
    paymentTerms: 'Net 30',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T14:00:00') },
    ],
  },
  {
    id: '3',
    quotationNumber: 'Q2024003',
    category: {
      code: '120501',
      name: 'Pengesanan dan Pemantauan',
    },
    summary: 'Pemasangan sistem CCTV dan sistem penggera keselamatan di bangunan kerajaan',
    description: `Pemasangan sistem CCTV berkualiti tinggi dan sistem penggera keselamatan bersepadu.

Skop Projek:
1. 40 unit kamera CCTV IP (4MP, infrared night vision)
2. 2 unit NVR (Network Video Recorder) 64 channel
3. Sistem penggera kebakaran bersepadu
4. Sistem kawalan akses dengan kad pintar
5. Monitor LCD 55" untuk bilik kawalan
6. Pendawaian dan pemasangan lengkap
7. Latihan operator dan manual pengguna
8. Tempoh jaminan 5 tahun

Lokasi: Kompleks Kerajaan Wilayah Persekutuan
Tempoh Siap: 3 bulan dari tarikh arahan kerja`,
    amount: 85000,
    ministry: {
      name: 'Jabatan Kerja Raya',
      department: 'Bahagian Keselamatan',
      contact: 'security@jkr.gov.my',
      phone: '+603-2697-1000',
      location: 'Kuala Lumpur',
    },
    dates: {
      published: new Date('2026-01-03'),
      closing: new Date('2026-01-22'),
      briefing: new Date('2026-01-12T14:00:00'),
    },
    tags: ['CCTV', 'Security', 'Surveillance', 'Access Control', 'Alarm'],
    status: 'accepted',
    isUrgent: false,
    documents: [
      { name: 'Tender Document.pdf', size: '3.8 MB', url: '#' },
      { name: 'Technical Requirements.pdf', size: '1.2 MB', url: '#' },
      { name: 'Site Plan.dwg', size: '456 KB', url: '#' },
    ],
    budgetCode: 'C34567',
    paymentTerms: 'Progressive Payment',
    notes: 'Promising tender - good pricing and specifications match our requirements.',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T08:00:00') },
      { action: 'Accepted by Ahmad', timestamp: new Date('2026-01-07T10:30:00'), user: 'Ahmad' },
    ],
  },
  {
    id: '4',
    quotationNumber: 'Q2024004',
    category: {
      code: '020302',
      name: 'Perabot Elektronik',
    },
    summary: 'Pembekalan sistem penghawa dingin (air conditioner) untuk pejabat baharu',
    description: `Pembekalan dan pemasangan sistem penghawa dingin untuk bangunan pejabat 5 tingkat.

Keperluan:
1. 30 unit aircond split inverter 2.5HP (R32 refrigerant)
2. 10 unit aircond split inverter 1.5HP
3. Pemasangan lengkap dengan piping dan wiring
4. Sistem remote control untuk setiap unit
5. Latihan penyelenggaraan asas
6. Tempoh jaminan 3 tahun untuk kompressor, 1 tahun untuk bahagian lain

Spesifikasi Teknikal:
- Energy efficiency rating minimum 4 bintang
- Low noise operation (<45dB)
- Auto restart function
- Timer function
- Eco-friendly refrigerant (R32)`,
    amount: 52000,
    ministry: {
      name: 'Kementerian Pendidikan Malaysia',
      department: 'Bahagian Pengurusan Fasiliti',
      contact: 'facilities@moe.gov.my',
      phone: '+603-8884-0000',
      location: 'Cyberjaya',
    },
    dates: {
      published: new Date('2026-01-04'),
      closing: new Date('2026-02-05'),
    },
    tags: ['Air Conditioner', 'HVAC', 'Electronics', 'Energy Efficient'],
    status: 'onhold',
    isUrgent: false,
    documents: [
      { name: 'Tender Document.pdf', size: '2.1 MB', url: '#' },
      { name: 'Floor Plans.pdf', size: '980 KB', url: '#' },
    ],
    budgetCode: 'D45678',
    paymentTerms: 'Net 45',
    notes: 'Waiting for budget confirmation from finance department.',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T14:00:00') },
      { action: 'Put on hold by Sarah', timestamp: new Date('2026-01-07T15:20:00'), user: 'Sarah' },
    ],
  },
  {
    id: '5',
    quotationNumber: 'Q2024005',
    category: {
      code: '010302',
      name: 'Penerbitan dan Penyiaran',
    },
    summary: 'Perkhidmatan percetakan buku panduan keselamatan dan brosur maklumat awam',
    description: `Percetakan dan penghantaran bahan bercetak untuk kempen kesedaran keselamatan awam.

Item Percetakan:
1. Buku Panduan Keselamatan (A5, full color, 48 halaman) - 5,000 salinan
2. Brosur Maklumat (A4 tri-fold, full color) - 20,000 salinan
3. Poster Kempen (A2, full color, laminated) - 1,000 helai
4. Sticker (waterproof, 10cm x 10cm) - 10,000 keping

Spesifikasi:
- Kertas art paper 120gsm untuk brosur
- Kertas art card 260gsm untuk buku panduan
- Cetakan offset full color
- Binding perfect untuk buku panduan
- Penyerahan dalam 3 batch
- Penghantaran ke 15 lokasi berbeza di Semenanjung`,
    amount: 18500,
    ministry: {
      name: 'Jabatan Bomba dan Penyelamat Malaysia',
      department: 'Bahagian Komunikasi Korporat',
      contact: 'corporate@bomba.gov.my',
      phone: '+603-2693-0000',
      location: 'Putrajaya',
    },
    dates: {
      published: new Date('2026-01-06'),
      closing: new Date('2026-01-20'),
    },
    tags: ['Printing', 'Publishing', 'Books', 'Brochures', 'Marketing'],
    status: 'available',
    isUrgent: false,
    documents: [
      { name: 'Tender Document.pdf', size: '1.5 MB', url: '#' },
      { name: 'Design Templates.zip', size: '45 MB', url: '#' },
    ],
    budgetCode: 'E56789',
    paymentTerms: 'Net 30',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T14:00:00') },
    ],
  },
  {
    id: '6',
    quotationNumber: 'Q2024006',
    category: {
      code: '020401',
      name: 'Peralatan Domestik',
    },
    summary: 'Bekalan peralatan dapur dan pantri untuk bangunan kompleks kerajaan',
    description: `Pembekalan peralatan dapur dan pantri untuk kompleks kerajaan yang baharu disiapkan.

Senarai Peralatan:
1. Peti sejuk commercial (500L) - 5 unit
2. Microwave oven (commercial grade) - 8 unit
3. Kettle elektrik (3L) - 10 unit
4. Water dispenser (hot & cold) - 15 unit
5. Coffee maker machine - 3 unit
6. Pinggan mangkuk set - 200 set
7. Cawan gelas set - 300 set
8. Cutlery set - 200 set

Syarat:
- Semua peralatan mestilah baru dan berkualiti
- Waranti minimum 2 tahun
- Penghantaran dan pemasangan di lokasi
- Latihan penggunaan peralatan`,
    amount: 28000,
    ministry: {
      name: 'Jabatan Audit Negara',
      department: 'Bahagian Pengurusan Kemudahan',
      contact: 'facilities@audit.gov.my',
      phone: '+603-8886-0000',
      location: 'Putrajaya',
    },
    dates: {
      published: new Date('2026-01-02'),
      closing: new Date('2026-01-25'),
    },
    tags: ['Kitchen', 'Pantry', 'Appliances', 'Domestic'],
    status: 'available',
    isUrgent: false,
    documents: [
      { name: 'Tender Document.pdf', size: '1.8 MB', url: '#' },
    ],
    budgetCode: 'F67890',
    paymentTerms: 'Net 30',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T14:00:00') },
    ],
  },
  {
    id: '7',
    quotationNumber: 'Q2024007',
    category: {
      code: '120401',
      name: 'Alat Keselamatan',
    },
    summary: 'Pembekalan kelengkapan keselamatan dan fire fighting equipment',
    description: `Pembekalan kelengkapan keselamatan untuk bangunan kerajaan.

Peralatan Keselamatan:
1. Fire extinguisher 9kg (ABC powder) - 100 unit
2. Fire extinguisher 4.5kg (CO2) - 50 unit
3. Fire hose reel & cabinet - 20 set
4. Emergency exit light - 80 unit
5. Fire alarm system - 1 set complete
6. Safety helmet - 100 unit
7. Reflective safety vest - 200 unit
8. First aid kit (complete) - 50 unit
9. Safety boots - 100 pairs
10. Fire blanket - 30 unit

Perkhidmatan:
- Pemasangan dan testing
- Sijil BOMBA untuk sistem
- Latihan keselamatan kepada warden
- Maintenance schedule`,
    amount: 62000,
    ministry: {
      name: 'Kementerian Sumber Asli dan Alam Sekitar',
      department: 'Bahagian Keselamatan dan Kesihatan Pekerjaan',
      contact: 'safety@nre.gov.my',
      phone: '+603-8871-0000',
      location: 'Putrajaya',
    },
    dates: {
      published: new Date('2025-12-28'),
      closing: new Date('2026-01-12'),
    },
    tags: ['Fire Safety', 'PPE', 'Emergency', 'Safety Equipment'],
    status: 'available',
    isUrgent: true,
    documents: [
      { name: 'Tender Document.pdf', size: '2.9 MB', url: '#' },
      { name: 'Safety Standards.pdf', size: '760 KB', url: '#' },
    ],
    budgetCode: 'G78901',
    paymentTerms: 'Net 30',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T14:00:00') },
    ],
  },
  {
    id: '8',
    quotationNumber: 'Q2024008',
    category: {
      code: '020301',
      name: 'Perabot Pejabat',
    },
    summary: 'Perabot pejabat: meja, kerusi, kabinet dan almari fail',
    description: `Pembekalan dan pemasangan perabot pejabat untuk pejabat baharu.

Perabot Diperlukan:
1. Meja pejabat eksekutif (1600mm) - 15 unit
2. Meja pejabat standard (1400mm) - 40 unit
3. Kerusi eksekutif - 15 unit
4. Kerusi pejabat - 40 unit
5. Kerusi tetamu - 30 unit
6. Kabinet 3 tingkat - 25 unit
7. Almari fail 4 laci - 35 unit
8. Meja mesyuarat 12 orang - 3 set
9. Rak buku - 20 unit
10. Partition workstation 4-pax - 10 set

Spesifikasi:
- Bahan berkualiti tinggi
- Finishing melamine
- Warna: Oak/Beige
- Mengikut piawaian ergonomik
- Tempoh jaminan 3 tahun`,
    amount: 95000,
    ministry: {
      name: 'Suruhanjaya Perkhidmatan Awam',
      department: 'Bahagian Perolehan',
      contact: 'procurement@spa.gov.my',
      phone: '+603-8881-0000',
      location: 'Putrajaya',
    },
    dates: {
      published: new Date('2026-01-01'),
      closing: new Date('2026-02-10'),
    },
    tags: ['Furniture', 'Office', 'Desk', 'Chair', 'Cabinet'],
    status: 'accepted',
    isUrgent: false,
    documents: [
      { name: 'Tender Document.pdf', size: '3.2 MB', url: '#' },
      { name: 'Furniture Specifications.pdf', size: '1.8 MB', url: '#' },
      { name: 'Layout Plan.pdf', size: '950 KB', url: '#' },
    ],
    budgetCode: 'H89012',
    paymentTerms: 'Progressive Payment',
    notes: 'Good value for money. Supplier has excellent track record.',
    activityHistory: [
      { action: 'Scraped by system', timestamp: new Date('2026-01-07T08:00:00') },
      { action: 'Accepted by Rahman', timestamp: new Date('2026-01-07T11:00:00'), user: 'Rahman' },
    ],
  },
];

// Function to get tenders by status
export const getTendersByStatus = (status: TenderStatus): Tender[] => {
  return mockTenders.filter(tender => tender.status === status);
};

// Function to get tender statistics
export const getTenderStats = () => {
  return {
    available: mockTenders.filter(t => t.status === 'available').length,
    accepted: mockTenders.filter(t => t.status === 'accepted').length,
    onhold: mockTenders.filter(t => t.status === 'onhold').length,
    removed: mockTenders.filter(t => t.status === 'removed').length,
    urgent: mockTenders.filter(t => t.isUrgent && t.status === 'available').length,
    total: mockTenders.length,
  };
};

// Categories
export const categories = [
  { code: '010302', name: 'Penerbitan dan Penyiaran' },
  { code: '020301', name: 'Perabot Pejabat' },
  { code: '020302', name: 'Perabot Elektronik' },
  { code: '020401', name: 'Peralatan Domestik' },
  { code: '020601', name: 'Bekalan Pejabat' },
  { code: '120401', name: 'Alat Keselamatan' },
  { code: '120501', name: 'Pengesanan dan Pemantauan' },
];
