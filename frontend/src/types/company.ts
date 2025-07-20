export interface CompanyData {
  id?: number;
  verified?: boolean;
  name: string;
  companyLogo?: string;
  email?: string;
  company_name?: string;
  designation?: string;
  phone?: string;
  website_url?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  is_profile_complete?: boolean;
  profileProgress?: number;
  // updateProfileProgress?: (progress: number) => Promise<void>;
  // updateUserProfile?: (data: any) => Promise<void>;
}

export interface CompanyRegistrationData {
  name: string;
  email: string;
  password: string;
  phone: string;
  industry: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  address: string;
}

export interface CompanyLoginData {
  email: string;
  password: string;
}

export interface CompanyPublicData {
  id: number;
  name: string;
  password?: string;
  email: string;
  email_otp?: string;
  email_otp_expiry?: string;
  email_verified?: boolean;
  phone?: string;
  country_code?: string;
  phone_otp?: string;
  phone_otp_expiry?: string;
  phone_verified?: boolean;
  website_url?: string;
  industry?: string;
  min_company_size?: number;
  max_company_size?: number;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  address?: string;
  banner_url?: string;
  logo_url?: string;
  rating?: number;
  ratings_count?: number;
  tagline?: string;
  tags?: string;
  about_us?: string;
  about_us_poster_url?: string;
  foundation_year?: number;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
  document_file_url?: string;
  document_type?: string;
}
