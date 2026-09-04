# OEPT Board Contacts

A tiny Vercel-hosted site that serves one live "save contact" page per board
member, at a URL like:

    https://YOUR-PROJECT.vercel.app/api/sarah
    https://YOUR-PROJECT.vercel.app/api/iskandar
    https://YOUR-PROJECT.vercel.app/api/mariam
    https://YOUR-PROJECT.vercel.app/api/simon
    https://YOUR-PROJECT.vercel.app/api/nour

Each page shows the person's info and a "Save Contact" button that downloads
a `.vcf` file, which iOS/Android open directly into Contacts.

The QR codes you print point to these URLs. **The QR code images never need
to change.** To update anyone's title, phone, or email, edit one file and
redeploy — the same printed QR code will then show the new info.

## Deploy (one-time)

1. Create a free account at https://vercel.com if you don't have one.
2. Put this folder in a GitHub repository (or use the Vercel CLI: run
   `vercel` from inside this folder and follow the prompts — no GitHub
   needed).
3. In the Vercel dashboard, "Import Project" from that repo (or just finish
   the CLI flow). No build settings needed — Vercel auto-detects the `api/`
   folder as serverless functions and `public/` as static files.
4. Vercel gives you a URL like `oept-contacts.vercel.app`. That's your live
   domain.
5. (Optional) Add a custom domain in Vercel's dashboard, e.g.
   `contacts.oept.gov.lb`, if you control that DNS.

## Editing someone's info later

1. Open `data/contacts.json`.
2. Change any field for that person (title, mobile, email, etc.).
3. Save, commit, and push (if using GitHub, Vercel redeploys automatically
   in about a minute). If using the CLI, run `vercel --prod` again.
4. Done — the same printed QR code now reflects the new info. Nothing needs
   reprinting.

You can even edit `data/contacts.json` directly in the GitHub web UI
(click the file, click the pencil icon, edit, commit) if you don't want to
use git locally.

## Generating the final QR codes

Once you know your live domain, generate one QR code per person pointing to:

    https://YOUR-DOMAIN/api/sarah
    https://YOUR-DOMAIN/api/iskandar
    https://YOUR-DOMAIN/api/mariam
    https://YOUR-DOMAIN/api/simon
    https://YOUR-DOMAIN/api/nour

Send me the domain once it's live and I'll generate print-ready QR code
images pointing at the real URLs.
