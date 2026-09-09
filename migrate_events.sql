-- Create a temporary function to migrate events
DO $$
DECLARE
    event_rec RECORD;
    new_org_id UUID;
    prof_name TEXT;
BEGIN
    FOR event_rec IN SELECT DISTINCT organizer_id FROM public.events WHERE workspace_id IS NULL LOOP
        
        -- Get profile name
        SELECT full_name INTO prof_name FROM public.profiles WHERE id = event_rec.organizer_id;
        IF prof_name IS NULL THEN
            prof_name := 'My Workspace';
        END IF;

        -- Create a workspace for this user
        INSERT INTO public.organizers (name, slug, owner_id)
        VALUES (prof_name, 'org-' || substring(event_rec.organizer_id::text from 1 for 8), event_rec.organizer_id)
        RETURNING id INTO new_org_id;

        -- Update events for this user
        UPDATE public.events SET workspace_id = new_org_id WHERE organizer_id = event_rec.organizer_id AND workspace_id IS NULL;
        
    END LOOP;
END $$;
