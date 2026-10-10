import { useController, useFormContext } from "react-hook-form";
import { hasDescriptionText } from "../../utils/description-content";
import type { VacancyFormValues } from "../../form-values";
import { DescriptionEditor } from "../editor/description-editor";
import { FormField } from "./form-field";

export function VacancyDescriptionField({
  disabled,
  hint = "Anda bisa mengubah templat yang telah disediakan di atas.",
}: {
  disabled: boolean;
  hint?: string;
}) {
  const { control } = useFormContext<VacancyFormValues>();
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name: "description",
    rules: {
      validate: (value) =>
        hasDescriptionText(value) || "Deskripsi wajib diisi.",
    },
  });

  return (
    <FormField
      id="description"
      label="Deskripsi"
      required
      hint={hint}
      error={error?.message}
    >
      <DescriptionEditor
        ref={(instance) => field.ref(instance)}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        disabled={disabled}
        invalid={Boolean(error)}
      />
    </FormField>
  );
}
