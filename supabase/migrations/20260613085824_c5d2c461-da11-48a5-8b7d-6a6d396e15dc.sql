GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Published packages viewable by all" ON public.packages;
CREATE POLICY "Published packages viewable by visitors"
ON public.packages
FOR SELECT
TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "Published blogs viewable by all" ON public.blogs;
CREATE POLICY "Published blogs viewable by visitors"
ON public.blogs
FOR SELECT
TO anon, authenticated
USING (published = true);

DROP POLICY IF EXISTS "Approved testimonials viewable" ON public.testimonials;
CREATE POLICY "Approved testimonials viewable by visitors"
ON public.testimonials
FOR SELECT
TO anon, authenticated
USING (approved = true);