export interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string | null
  contactNumber: string
  balance: number
  registrationDate: string
  address: Address | null
}

export interface Address {
  street: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
}
