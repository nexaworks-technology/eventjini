import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  // If user is not logged in and tries to access dashboard, redirect to login
  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is logged in and tries to access auth routes, redirect to dashboard or redirect param
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    
    if (redirectParam) {
      url.pathname = redirectParam;
      url.search = ''; // clear query params
    } else {
      url.pathname = '/my-tickets'; // Default landing for attendees now
    }
    return NextResponse.redirect(url);
  }

  // Check role for dashboard access
  if (user && isDashboardRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_organizer')
      .eq('id', user.id)
      .single();

    // If non-organizer tries to access dashboard, redirect to onboarding
    if (!profile?.is_organizer && request.nextUrl.pathname !== '/dashboard/onboarding') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/onboarding';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
};
