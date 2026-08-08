export type Applicant = {
  id: string;
  userId: string;
  username: string;
  userStatus: "aktif" | "nonaktif";
  name: string;
  email: string;
  registrationNumber: string;
  nim: string;
  periodName: string;
  program: string;
  concentration: string;
  statusRpl: string;
  identity: {
    fullName?: string;
    nik?: string;
    placeOfBirth?: string;
    dateOfBirth?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  work: Record<string, unknown>;
  cv: Record<string, any>;
  progress: {
    paymentStatus: string;
    f02Status: string;
    f03Status: string;
    assessmentStatus: string;
    resultStatus: string;
  };
  documents: Array<{
    type?: string;
    fileName?: string;
    fileUrl?: string;
    validationStatus?: string;
  }>;
};

export type ApplicantListResponse = {
  data: Applicant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    periods: string[];
    statuses: string[];
  };
};
