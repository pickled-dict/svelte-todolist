import { signedIn } from "$lib/store";
import type { PageLoadEvent } from "./$types";

export async function load({parent, data}: PageLoadEvent) {
  await parent();

  if (data.verified) {
    signedIn.set(true)
  } else {
    signedIn.set(false)
  }
}
