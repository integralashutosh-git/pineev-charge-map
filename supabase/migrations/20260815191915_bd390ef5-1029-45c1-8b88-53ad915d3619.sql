REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

DROP POLICY "Admins can read contact messages" ON public.contact_messages;
DROP POLICY "Admins can read partner applications" ON public.partner_applications;

CREATE POLICY "Admins can read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
));

CREATE POLICY "Admins can read partner applications"
ON public.partner_applications
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role
));