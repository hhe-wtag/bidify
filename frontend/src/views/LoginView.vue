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
import axios from 'axios'

const router = useRouter()

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email('Please enter a valid email address.').nonempty('Email is required.'),
    password: z.string().nonempty('Password is required.'),
  }),
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit(async (data) => {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email: data.email,
      password: data.password,
    })

    localStorage.setItem('token', response.data.token)

    toast({
      title: 'Login Successful',
      description: 'You have logged in successfully.',
    })
  } catch (error) {
    console.error('Error logging in:', error.response?.data)
    toast({
      title: 'Login Failed',
      description: error.response?.data?.message || 'Please try again.',
    })
  }
})
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-4">
          <!-- Email Field -->
          <FormField name="email" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Email<span class="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Password Field -->
          <FormField name="password" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Password<span class="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </CardContent>
      <CardFooter class="flex justify-between">
        <Button variant="outline"> Forgot Password </Button>
        <Button @click="onSubmit"> Login </Button>
      </CardFooter>
    </Card>
  </div>
</template>
