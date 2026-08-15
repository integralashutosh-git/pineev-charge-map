GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

GRANT SELECT ON public.contact_messages TO authenticated;

CREATE POLICY "Admins can read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read partner applications"
ON public.partner_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));