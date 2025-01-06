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
import * as z from 'zod'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

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
  const { email, password } = data
  const result = await userStore.login(email, password)

  if (result.success) {
    toast({
      title: 'Login Successful',
      description: result.message,
    })
    router.push({ name: 'profile' })
  } else {
    toast({
      title: 'Login Failed',
      description: result.message,
    })
  }
})

const redirectToRegister = () => {
  router.push({ name: 'register' })
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen-minus-nav bg-gray-100">
    <Card class="w-[500px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="space-y-4">
          <FormField name="email" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>Email<span class="text-red-500 ml-1">*</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

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
        <Button variant="outline" @click="redirectToRegister"> Register </Button>
        <Button @click="onSubmit"> Login </Button>
      </CardFooter>
    </Card>
  </div>
</template>
