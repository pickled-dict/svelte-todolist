import { signedIn } from "$lib/store";
import type { LayoutLoadEvent } from "./$types";

export async function load({parent, data}: LayoutLoadEvent) {
  await parent();

  if (data.verified) {
    signedIn.set(true)
  } else {
    signedIn.set(false)
  }
}
