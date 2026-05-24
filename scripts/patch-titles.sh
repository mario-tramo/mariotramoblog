#!/bin/bash
source .env.local
API="https://geqdctr3.api.sanity.io/v2024-01-01/data/mutate/production"

patch() {
  local id="$1"
  local title="$2"
  curl -s -X POST \
    -H "Authorization: Bearer $SANITY_API_WRITE_TOKEN" \
    -H "Content-Type: application/json" \
    "$API" \
    -d "{\"mutations\":[{\"patch\":{\"id\":\"$id\",\"set\":{\"title\":\"$title\"}}}]}" > /dev/null
  echo "  OK $id → $title"
}

echo "Patching titles..."
patch "0f2c80d4-7090-48f6-9966-3a41af093b44" "NBA Playoffs: Jokic porta Denver alla rimonta storica"
patch "20420ee5-ba11-4e5e-8862-e2153648743b" "Serie A: L'Inter batte il Milan 3-1, decisivo Lautaro"
patch "394fb303-8e9e-4ebc-a28c-629aec9baad6" "Il pressing di Gasperini: come l'Atalanta soffoca gli avversari"
patch "4027b606-891e-4f1c-9fc9-1f3c7578bc18" "Champions League 2026: il Milan torna in semifinale"
patch "4d3b1356-3248-4dce-a03c-6e6c56a8e221" "La difesa a 3 nel basket moderno: evoluzione e applicazioni in Eurolega"
patch "5a64c4c4-e2e9-48c0-b54f-c1e0018a1c94" "Sinner conquista il Roland Garros: primo italiano a vincere a Parigi"
patch "6ad274b4-616c-439e-9ffe-bfae9800ecc1" "Olimpia Milano, finale Scudetto: Shields guida la rincorsa"
patch "6f30fca6-3577-491d-8c6c-4b842be8939e" "Musetti-Berrettini: il derby italiano infiamma il Queen's"
patch "6fd122f5-579e-4ca2-bdb7-38c09c9bd5fe" "Real Madrid-Arsenal: la rimonta impossibile dei Blancos"
patch "7e16e869-eb48-4655-a77d-a267ffe58dfa" "Atalanta-Roma 2-2: Gasperini reinventa il pressing alto"
patch "85d2f655-402a-4385-bddf-1ed3dbdde563" "L'Inter blinda Chivu: rinnovo per il tecnico dello scudetto"
patch "90e35b51-a4cf-4a2d-af36-4c13bbd14997" "Champions League: le sorprese dei quarti di finale"
patch "93704e57-62bd-4c20-a9eb-43aeea955509" "Milan-Juventus: il big match che decide la Champions"
patch "9aca2546-6988-4ddc-a348-cb346122d313" "Calciomercato Juventus: Osimhen è il grande obiettivo per l'estate"
patch "9e2806ed-14fb-4df8-b42b-2cf2c2f25071" "Verstappen domina a Monaco: quarta vittoria consecutiva"
patch "a07133e8-b8ba-405b-b584-d7a260f6c777" "Perché la Super League è un'idea che non morirà mai"
patch "c644e7a2-6e55-4cfb-86b9-5ebbd8446131" "Ferrari, la nuova ala anteriore rivoluziona la SF-26"
patch "cb08635e-019c-4daf-be8e-982a073e326b" "Milan, colpo dalla Premier: in arrivo il nuovo numero 10"
patch "da958281-01b0-46b1-9b38-82e86bce7bf2" "Napoli campione d'Italia: terzo Scudetto in quattro anni"
patch "e7ef3453-e27a-4e2e-a72a-620b683616c5" "Kvaratskhelia-PSG, ci siamo: le cifre dell'affare"
patch "eb590744-6707-4f97-80c9-92d196dc888e" "Guida alla finale di Champions League 2026 a Milano"
patch "f76b808a-fffb-4e35-85d1-fa45ecc81461" "Il VAR sta uccidendo l'emozione del calcio?"
echo "Done!"
