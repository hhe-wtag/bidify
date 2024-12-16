<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { h } from 'vue'
import * as z from 'zod'

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

const onSubmit = handleSubmit((values) => {
  console.log('Submitted values:', values)
  toast({
    title: 'Registration Successful',
    description: h(
      'pre',
      { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' },
      h('code', { class: 'text-white' }, JSON.stringify(values, null, 2)),
    ),
  })
})
</script>

<template>
  <form class="w-2/3 space-y-6" @submit="onSubmit">

    <FormField v-slot="{ componentField }" name="firstName">
      <FormItem>
        <FormLabel>First Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="John" v-bind="componentField" />
        </FormControl>
        <FormDescription> Enter your first name. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="lastName">
      <FormItem>
        <FormLabel>Last Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Doe" v-bind="componentField" />
        </FormControl>
        <FormDescription> Enter your last name. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="you@example.com" v-bind="componentField" />
        </FormControl>
        <FormDescription> Enter your email address. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="contactNumber">
      <FormItem>
        <FormLabel>Contact Number</FormLabel>
        <FormControl>
          <Input type="text" placeholder="1234567890" v-bind="componentField" />
        </FormControl>
        <FormDescription> Enter your 10-digit contact number. </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="Enter your password" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          Your password must be at least 8 characters, include one uppercase letter, one lowercase
          letter, and one number.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit"> Register </Button>
  </form>
</template>
