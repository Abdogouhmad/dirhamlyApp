import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field"

const schema = z.object({
  amount: z.coerce.number<number>().positive("Amount must be greater than 0"),
  type: z.enum(["expense", "income"]),
  date: z.string().min(1),
  tags: z.string().optional(),
  category: z.string().min(1),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const getCurrency = () => {
  try {
    const locale = navigator.language

    const map: Record<string, string> = {
      "en-US": "USD",
      "en-GB": "GBP",
      "fr-FR": "EUR",
      "ar-MA": "MAD",
      "fr-MA": "MAD",
    }

    return map[locale] ?? "USD"
  } catch {
    return "USD"
  }
}

export default function AddTransactionPage() {
  const currency = getCurrency()

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const type = watch("type")

  function onSubmit(data: FormValues) {
    console.log("Transaction:", data)
  }

  return (
    <div className="flex justify-center w-full p-8">
      <div className="w-full max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>

            <FieldSet>
              <FieldLegend>Add Transaction</FieldLegend>
              <FieldDescription>
                Log an income or expense
              </FieldDescription>

              <FieldGroup className="grid grid-cols-2 gap-6 mt-6">

                {/* AMOUNT (full width) */}
                <Field className="col-span-2">
                  <FieldLabel>Amount</FieldLabel>

                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`pr-14 ${
                        type === "expense"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                      {...register("amount")}
                    />

                    <span className="absolute right-3 top-2 text-sm text-muted-foreground">
                      {currency}
                    </span>
                  </div>
                </Field>

                {/* TYPE */}
                <Field>
                  <FieldLabel>Type</FieldLabel>

                  <Select
                    defaultValue="expense"
                    onValueChange={(v) =>
                      setValue("type", v as "expense" | "income")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* DATE */}
                <Field>
                  <FieldLabel>Date</FieldLabel>
                  <Input type="date" {...register("date")} />
                </Field>

                {/* TAGS */}
                <Field>
                  <FieldLabel>Tags</FieldLabel>
                  <Input placeholder="#food #travel" {...register("tags")} />
                </Field>

                {/* CATEGORY */}
                <Field>
                  <FieldLabel>Category</FieldLabel>

                  <Select
                    onValueChange={(v) => setValue("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="bills">Bills</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* DESCRIPTION */}
                <Field className="col-span-2">
                  <FieldLabel>Description</FieldLabel>

                  <Textarea
                    placeholder="What was this transaction for?"
                    className="resize-none"
                    {...register("description")}
                  />
                </Field>

              </FieldGroup>
            </FieldSet>

            {/* ACTIONS */}
            <Field orientation="horizontal" className="justify-end mt-6">
              <Button type="submit">Save Transaction</Button>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Field>

          </FieldGroup>
        </form>
      </div>
    </div>
  )
}