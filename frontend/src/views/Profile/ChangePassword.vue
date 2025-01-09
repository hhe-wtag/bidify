<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { Separator } from '@/components/ui/separator'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ScrollArea } from '@/components/ui/scroll-area'

const router = useRouter()
const userStore = useUserStore()

const formSchema = toTypedSchema(
  z.object({
    currentPassword: z.string().nonempty('Current Password is required.'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must include at least one number.')
      .nonempty('New Password is required.'),
    confirmPassword: z.string().nonempty('Confirm Password is required.'),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
})

const redirectToProfile = () => {
  resetForm()
  router.push({ name: 'profile' })
}

const onSubmit = handleSubmit(async (data) => {
  const { currentPassword, newPassword, confirmPassword } = data

  if (newPassword !== confirmPassword) {
    toast({
      title: 'Passwords do not match',
      description: 'Please ensure your new password and confirm password match.',
      variant: 'destructive',
    })
    return
  }

  const result = await userStore.updatePassword(currentPassword, newPassword)

  if (result.success) {
    toast({
      title: 'Password Update Successful',
      description: result.message,
      variant: 'default',
    })
    resetForm()
  } else {
    toast({
      title: 'Password Update Failed',
      description: result.message,
      variant: 'destructive',
    })
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Change Password</h3>
    <p class="text-sm text-muted-foreground">
      Choose a strong password with at least 8 characters.
    </p>
  </div>
  <Separator class="mt-8 mb-8" />
  <form @submit.prevent="onSubmit" class="space-y-8">
    <ScrollArea class="grid gap-8 max-h-[500px] overflow-auto">
      <div class="flex flex-col gap-8 pr-4 pl-1 pb-1">
        <FormField name="currentPassword" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Current Password<span class="text-red-500 ml-1">*</span></FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Enter your current password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="newPassword" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>New Password<span class="text-red-500 ml-1">*</span></FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Enter your new password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="confirmPassword" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Confirm Password<span class="text-red-500 ml-1">*</span></FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Confirm your new password"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </ScrollArea>
    <div class="flex gap-2 justify-start">
      <Button type="onSubmit"> Change Password </Button>

      <Button type="button" variant="outline" @click="redirectToProfile"> Cancel </Button>
    </div>
  </form>
</template>
