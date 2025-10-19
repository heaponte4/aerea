export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  thumbnailUrl?: string;
}

export interface JobComment {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface RescheduleHistory {
  id: string;
  oldDate: Date;
  oldTime: string;
  newDate: Date;
  newTime: string;
  reason: string;
  rescheduledAt: Date;
}

export interface PhotographerJob {
  id: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  serviceType: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  servicePrice: number;
  addons: { name: string; price: number }[];
  notes?: string;
  deliveredAt?: Date;
  uploadedFiles?: UploadedFile[];
  comments?: JobComment[];
  checklist?: ChecklistItem[];
  rescheduleHistory?: RescheduleHistory[];
  coordinates?: { lat: number; lng: number };
}

export interface Payment {
  id: string;
  jobId: string;
  propertyAddress: string;
  amount: number;
  travelFee: number;
  date: Date;
  status: 'pending' | 'paid' | 'processing';
  method?: string;
}

export const photographerJobs: PhotographerJob[] = [
  {
    id: 'job1',
    propertyAddress: '123 Ocean Drive',
    propertyCity: 'Miami Beach',
    propertyState: 'FL',
    serviceType: 'Photography',
    scheduledDate: new Date('2025-10-18'),
    scheduledTime: '10:00 AM',
    status: 'upcoming',
    clientName: 'John Doe',
    clientEmail: 'john@luxuryrealty.com',
    clientPhone: '(305) 555-0100',
    servicePrice: 250,
    addons: [
      { name: 'Virtual Staging', price: 125 },
      { name: 'Floor Plan', price: 75 },
    ],
    notes: 'Client prefers natural lighting. Property has ocean views.',
    comments: [
      {
        id: 'comment1',
        text: 'Property owner will be present during shoot',
        createdAt: new Date('2025-10-15'),
        createdBy: 'Sarah Mitchell',
      },
    ],
    checklist: [
      { id: 'check1', text: 'Confirm property access', completed: true },
      { id: 'check2', text: 'Check lighting conditions', completed: false },
      { id: 'check3', text: 'Prepare equipment', completed: false },
      { id: 'check4', text: 'Review client requirements', completed: true },
      { id: 'check5', text: 'Shoot exterior photos', completed: false },
      { id: 'check6', text: 'Shoot interior photos', completed: false },
      { id: 'check7', text: 'Virtual staging preparation', completed: false },
      { id: 'check8', text: 'Create floor plan', completed: false },
    ],
    rescheduleHistory: [],
    coordinates: { lat: 25.7907, lng: -80.1300 },
  },
  {
    id: 'job2',
    propertyAddress: '456 Sunset Boulevard',
    propertyCity: 'Miami',
    propertyState: 'FL',
    serviceType: 'Twilight Photos',
    scheduledDate: new Date('2025-10-19'),
    scheduledTime: '6:30 PM',
    status: 'upcoming',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@realestate.com',
    clientPhone: '(305) 555-0200',
    servicePrice: 200,
    addons: [],
    notes: 'Sunset shoot, arrive 30 minutes early for setup.',
    comments: [],
    checklist: [
      { id: 'check9', text: 'Check sunset time', completed: true },
      { id: 'check10', text: 'Scout location beforehand', completed: false },
      { id: 'check11', text: 'Prepare twilight equipment', completed: false },
      { id: 'check12', text: 'Turn on all exterior lights', completed: false },
      { id: 'check13', text: 'Shoot golden hour photos', completed: false },
      { id: 'check14', text: 'Shoot twilight photos', completed: false },
    ],
    rescheduleHistory: [],
    coordinates: { lat: 25.7617, lng: -80.1918 },
  },
  {
    id: 'job3',
    propertyAddress: '789 Bay Street',
    propertyCity: 'Coral Gables',
    propertyState: 'FL',
    serviceType: 'Photography',
    scheduledDate: new Date('2025-10-10'),
    scheduledTime: '2:00 PM',
    status: 'completed',
    clientName: 'Michael Brown',
    clientEmail: 'michael@premiumhomes.com',
    clientPhone: '(305) 555-0300',
    servicePrice: 250,
    addons: [{ name: 'Advanced Editing', price: 80 }],
    deliveredAt: new Date('2025-10-11'),
    coordinates: { lat: 25.7217, lng: -80.2686 },
  },
  {
    id: 'job4',
    propertyAddress: '321 Palm Avenue',
    propertyCity: 'Miami',
    propertyState: 'FL',
    serviceType: 'Drone Photography',
    scheduledDate: new Date('2025-10-08'),
    scheduledTime: '11:00 AM',
    status: 'completed',
    clientName: 'Emily Davis',
    clientEmail: 'emily@coastalrealty.com',
    clientPhone: '(305) 555-0400',
    servicePrice: 300,
    addons: [{ name: 'Drone Video Clip', price: 100 }],
    deliveredAt: new Date('2025-10-09'),
    coordinates: { lat: 25.7743, lng: -80.1937 },
  },
  {
    id: 'job5',
    propertyAddress: '567 Marina Way',
    propertyCity: 'Key Biscayne',
    propertyState: 'FL',
    serviceType: 'Photography',
    scheduledDate: new Date('2025-10-05'),
    scheduledTime: '9:00 AM',
    status: 'completed',
    clientName: 'Robert Wilson',
    clientEmail: 'robert@elitehomes.com',
    clientPhone: '(305) 555-0500',
    servicePrice: 250,
    addons: [],
    deliveredAt: new Date('2025-10-06'),
    coordinates: { lat: 25.6926, lng: -80.1625 },
  },
];

export const photographerPayments: Payment[] = [
  {
    id: 'pay1',
    jobId: 'job3',
    propertyAddress: '789 Bay Street',
    amount: 330,
    travelFee: 50,
    date: new Date('2025-10-12'),
    status: 'paid',
    method: 'Direct Deposit',
  },
  {
    id: 'pay2',
    jobId: 'job4',
    propertyAddress: '321 Palm Avenue',
    amount: 400,
    travelFee: 50,
    date: new Date('2025-10-10'),
    status: 'paid',
    method: 'Direct Deposit',
  },
  {
    id: 'pay3',
    jobId: 'job5',
    propertyAddress: '567 Marina Way',
    amount: 250,
    travelFee: 50,
    date: new Date('2025-10-07'),
    status: 'paid',
    method: 'Direct Deposit',
  },
  {
    id: 'pay4',
    jobId: 'job1',
    propertyAddress: '123 Ocean Drive',
    amount: 450,
    travelFee: 50,
    date: new Date('2025-10-25'),
    status: 'pending',
  },
  {
    id: 'pay5',
    jobId: 'job2',
    propertyAddress: '456 Sunset Boulevard',
    amount: 200,
    travelFee: 50,
    date: new Date('2025-10-26'),
    status: 'pending',
  },
];
