<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { h } from 'vue'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.ts'

const router = useRouter()
const userStore = useUserStore()

const formSchema = toTypedSchema(
  z.object({
    firstName: z
      .string()
      .min(2, 'First Name must have at least 2 characters.')
      .nonempty('First Name is required.'),
    lastName: z
      .string()
      .min(2, 'Last Name must have at least 2 characters.')
      .nonempty('Last Name is required.'),
    email: z.string().email('Please enter a valid email address.').nonempty('Email is required.'),
    contactNumber: z
      .string()
      .regex(/^01\d{9}$/, 'Contact Number must be 11 digits and start with 01.')
      .nonempty('Contact Number is required.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must include at least one number.')
      .nonempty('Password is required.'),
  }),
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (data) => {
  const result = await userStore.register(data)

  if (result.success) {
    toast({
      title: 'Registration Successful',
      description: result.message || 'Your registration was successful!',
    })
    router.push({ name: 'login' })
  } else {
    toast({
      title: 'Registration Failed',
      description: result.message || 'Please try again.',
    })
  }
})

const redirectToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen-minus-nav bg-gray-100">
    <Card class="w-[500px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <FormField name="firstName" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>
                  First Name
                  <span class="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="John" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="lastName" v-slot="{ componentField }">
              <FormItem>
                <FormLabel>
                  Last Name
                  <span class="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Doe" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <FormField name="email" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>
                Email
                <span class="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="contactNumber" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>
                Contact Number
                <span class="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input type="text" placeholder="01234567890" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="password" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>
                Password
                <span class="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </CardContent>
      <CardFooter class="flex justify-between">
        <Button variant="outline" @click="redirectToLogin"> Login </Button
        ><Button @click="onSubmit"> Register </Button>
      </CardFooter>
    </Card>
  </div>
</template>
