# Equipment Photos Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement and execute a supervised pilot to download, review, and persist official equipment photos for the top 10 most frequent models in the hospital inventory (impacting 524 equipments in Supabase).

**Architecture:** A two-phase pipeline using Node.js scripts: phase 1 downloads candidate images to a local staging directory (`temp_pilot_images/`) for visual human-in-the-loop review; phase 2 uploads validated images to Supabase Storage (`equipment-images/photos/`) and bulk-updates the `foto_url` column in the `equipments` database table without overwriting pre-existing photos.

**Tech Stack:** Node.js, `@supabase/supabase-js`, `https`/`fetch`, Supabase Storage, PostgreSQL.

---

### Task 1: Environment & Directory Setup

**Files:**
- Create directory: `biomed-maintenance-app/temp_pilot_images/`
- Modify: `biomed-maintenance-app/.gitignore`

- [ ] **Step 1: Create local staging directory**
Create `biomed-maintenance-app/temp_pilot_images` to store candidate photos locally during the verification stage.

- [ ] **Step 2: Add staging directory to .gitignore**
Ensure temporary download artifacts do not pollute the git repository.

- [ ] **Step 3: Commit setup**
Commit message: `chore(inventory): setup temp directory for equipment photos staging`

---

### Task 2: Implement Image Downloader Script (`download_pilot_images.cjs`)

**Files:**
- Create: `biomed-maintenance-app/scripts/download_pilot_images.cjs`

- [ ] **Step 1: Define pilot models catalog and verified image sources**
Configure the 10 target models with official manufacturer product image sources:
1. Gentec FM-197B-15L-CH (Flujómetro de O2)
2. Lenz GZ-805 (Tensiómetro digital)
3. Oxywatch MD300C29 (Pulsoxímetro digital)
4. Caresens N VOICE (Glucómetro parlante)
5. Pahsco 434 (Flujómetro de O2)
6. Htc HTC-2 (Termohigrómetro digital)
7. Acare VRA-391 (Regulador de vacío / Vacutron)
8. Acare FA-OS-04 (Flujómetro de O2)
9. Pulmo-Med 7E-A (Aspirador de secreciones)
10. Edan iM70 (Monitor de signos vitales)

- [ ] **Step 2: Implement download and validation logic**
Implement streaming download via `https`, checking:
- HTTP 200 response
- Valid image MIME type (`image/png`, `image/jpeg`, `image/webp`)
- Minimum file size (> 5 KB) to avoid broken thumbnails or 404 HTML error pages
- Save to `temp_pilot_images/${marca}_${modelo}.png` (sanitized filename)

- [ ] **Step 3: Execute download script**
Run: `node scripts/download_pilot_images.cjs`
Expected: 10 images successfully downloaded into `temp_pilot_images/`.

- [ ] **Step 4: Commit downloader script**
Commit message: `feat(inventory): add pilot equipment photos download script`

---

### Task 3: Human Verification Gate (Quality Assurance)

**Files:**
- Review: `biomed-maintenance-app/temp_pilot_images/*`

- [ ] **Step 1: Inspect downloaded image files**
Verify that each of the 10 downloaded images matches the clinical equipment model and has clean framing/background.

- [ ] **Step 2: User confirmation**
Prompt user to confirm the downloaded images or request adjustments before uploading to cloud storage.

---

### Task 4: Implement Supabase Storage & DB Synchronizer (`upload_pilot_images.cjs`)

**Files:**
- Create: `biomed-maintenance-app/scripts/upload_pilot_images.cjs`

- [ ] **Step 1: Read files and map to database models**
Script scans `temp_pilot_images/`, maps each file to its corresponding `(marca, modelo)` pair in the catalog.

- [ ] **Step 2: Upload to Supabase Storage bucket**
Upload each file to `equipment-images/photos/${filename}`:
- `upsert: true`
- `contentType: 'image/png'` or detected MIME type
- Retrieve public URL: `https://gzdspkhpxkibjxbfdeuc.supabase.co/storage/v1/object/public/equipment-images/photos/${filename}`

- [ ] **Step 3: Update `equipments` table**
Execute safe update for each model:
```sql
UPDATE equipments
SET foto_url = :publicUrl
WHERE UPPER(TRIM(marca)) = UPPER(TRIM(:marca))
  AND UPPER(TRIM(modelo)) = UPPER(TRIM(:modelo))
  AND (foto_url IS NULL OR foto_url = '');
```

- [ ] **Step 4: Commit uploader script**
Commit message: `feat(inventory): add pilot equipment photos upload and sync script`

---

### Task 5: Execute Upload & End-to-End Verification

**Files:**
- Supabase DB & Storage
- `biomed-maintenance-app/src/utils/pdfProfileGenerator.ts`

- [ ] **Step 1: Run upload script**
Run: `node scripts/upload_pilot_images.cjs`
Expected: 10 images uploaded to Storage; ~524 rows updated across the 10 models.

- [ ] **Step 2: Query Supabase DB for verification**
Verify count of equipment with photo updated from 498 to ~1,022.

- [ ] **Step 3: Verify Hoja de Vida PDF rendering**
Run test script generating Hoja de Vida v5.0 for one of the updated equipments (e.g. Edan iM70) and verify that the photo embeds seamlessly without errors.

