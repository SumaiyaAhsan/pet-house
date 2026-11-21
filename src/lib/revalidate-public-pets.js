import { revalidatePath } from "next/cache";

export function revalidatePublicPetListings() {
  revalidatePath("/");
  revalidatePath("/pets");
  revalidatePath("/api/pets/all");
}
