import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/db';
import { stylistes } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		// Rediriger vers signin avec l'URL de retour
		throw redirect(303, `/signin?redirect=${encodeURIComponent(url.pathname)}`);
	}

	// Charger le profil du styliste
	const [profile] = await db
		.select()
		.from(stylistes)
		.where(eq(stylistes.userId, locals.user.id))
		.limit(1);

	// Si pas de profil, rediriger vers création profil
	if (!profile && url.pathname !== '/profile/create') {
		throw redirect(303, '/profile/create');
	}

	return {
		user: locals.user,
		profile: profile
			? {
					id: profile.id,
					salonName: profile.salonName,
					phone: profile.phone,
					email: profile.email,
					city: profile.city,
					country: profile.country
			  }
			: null
	};
};
