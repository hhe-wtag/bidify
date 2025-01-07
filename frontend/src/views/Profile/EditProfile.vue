<template>
  <div>
    <h3 class="text-lg font-medium">Update Profile</h3>
    <p class="text-sm text-muted-foreground">Update your account details</p>
  </div>
  <Separator class="mt-8 mb-8" />

  <form class="space-y-8" @submit.prevent="handleSubmit">
    <ScrollArea class="h-[500px] grid gap-8">
      <div class="flex flex-col gap-8 pr-4 pl-1 pb-1">
        <FormField name="firstName">
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input
                v-model="profile.firstName"
                type="text"
                id="firstName"
                class="input"
                placeholder="Enter first name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="lastName">
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input
                v-model="profile.lastName"
                type="text"
                id="lastName"
                class="input"
                placeholder="Enter last name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="contactNumber">
          <FormItem>
            <FormLabel>Contact Number</FormLabel>
            <FormControl>
              <Input
                v-model="profile.contactNumber"
                type="text"
                id="contactNumber"
                class="input"
                placeholder="Enter contact number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="balance">
          <FormItem>
            <FormLabel>Balance</FormLabel>
            <FormControl>
              <Input
                v-model="profile.balance"
                type="number"
                id="balance"
                class="input"
                placeholder="Enter balance"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="address">
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormDescription
              >Please enter your full address including street, city, state, zip code, and
              country.</FormDescription
            ></FormItem
          >
        </FormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField name="street">
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input
                  v-model="profile.address.street"
                  type="text"
                  id="street"
                  class="input"
                  placeholder="Enter street"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="city">
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input
                  v-model="profile.address.city"
                  type="text"
                  id="city"
                  class="input"
                  placeholder="Enter city"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="state">
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input
                  v-model="profile.address.state"
                  type="text"
                  id="state"
                  class="input"
                  placeholder="Enter state"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="zipCode">
            <FormItem>
              <FormLabel>Zip Code</FormLabel>
              <FormControl>
                <Input
                  v-model="profile.address.zipCode"
                  type="text"
                  id="zipCode"
                  class="input"
                  placeholder="Enter Zip Code"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
        <FormField name="country">
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input
                v-model="profile.address.country"
                type="text"
                id="country"
                class="input"
                placeholder="Enter Country"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </ScrollArea>

    <div class="flex gap-2 justify-start">
      <Button type="submit"> Update profile </Button>

      <Button type="button" variant="outline" @click="redirectToProfile"> Cancel </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/toast'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useUserStore } from '@/stores/user'
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ScrollArea } from '@/components/ui/scroll-area'

const userStore = useUserStore()
const router = useRouter()

const initialProfile = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  balance: 0,
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
}

const profile = reactive({ ...initialProfile })

const redirectToProfile = () => {
  resetForm()
  router.push({ name: 'profile' })
}

const loadUserProfile = async () => {
  if (!userStore.profile) {
    try {
      await userStore.fetchUserProfile()
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }
  if (userStore.profile) {
    Object.assign(profile, {
      firstName: userStore.profile.firstName,
      lastName: userStore.profile.lastName,
      contactNumber: userStore.profile.contactNumber,
      balance: userStore.profile.balance,
      address: {
        street: userStore.profile.address?.street || '',
        city: userStore.profile.address?.city || '',
        state: userStore.profile.address?.state || '',
        zipCode: userStore.profile.address?.zipCode || '',
        country: userStore.profile.address?.country || '',
      },
    })
  }
}

onMounted(loadUserProfile)

const resetForm = () => {
  Object.assign(profile, { ...initialProfile })
}

const handleSubmit = async () => {
  try {
    const updatedProfile = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      contactNumber: profile.contactNumber,
      balance: profile.balance ?? 0,
      address: {
        street: profile.address.street || null,
        city: profile.address.city || null,
        state: profile.address.state || null,
        zipCode: profile.address.zipCode || null,
        country: profile.address.country || null,
      },
    }

    const result = await userStore.updateUserInfo(updatedProfile)

    if (result.success) {
      toast({
        title: 'Profile Updated Successfully',
        description: result.message,
        variant: 'default',
      })
    } else {
      toast({
        title: 'Profile Update Failed',
        description: result.message,
        variant: 'destructive',
      })
    }
  } catch (error) {
    toast({
      title: 'Error Updating Profile',
      description: 'Something went wrong while updating the profile.',
      variant: 'destructive',
    })
  }
}
</script>
