## PRD — Dynamic Filter Resolution for Collection Blocks

### Obiettivo

Consentire ai blocchi di tipo Collection (o componenti equivalenti) di recuperare contenuti dinamicamente in base a filtri configurati in Sanity.

I valori dei filtri devono poter essere definiti:

* staticamente in Sanity;
* dinamicamente tramite parametri dell’URL (query params o route params);
* tramite un valore di fallback, se il parametro dinamico non è presente.

---

## Requisiti Funzionali

### Configurazione del filtro

Ogni filtro deve definire:

1. **Campo target**
   Il campo del documento su cui applicare il filtro (es. categoria, tag, autore).
2. **Modalità di risoluzione del valore**
   * Static
   * Dynamic
3. **Valore statico**
   Il valore impostato direttamente in Sanity.
4. **Nome del parametro URL**
   Il nome del query param o route param da leggere.
5. **Valore di fallback** (opzionale)
   Valore da utilizzare se il parametro dinamico non è presente.

---

## Regole di Risoluzione

### Modalità Static

Il filtro utilizza sempre il valore configurato in Sanity.

### Modalità Dynamic

Il sistema segue questo ordine:

1. Legge il valore dal parametro URL configurato.
2. Se il parametro esiste, usa quel valore.
3. Se il parametro non esiste e il fallback è definito, usa il fallback.
4. Se nessun valore è disponibile, il filtro non viene applicato.

---

## Esempi

### Query Parameter

Configurazione:

* Campo target: categoria
* Modalità: Dynamic
* Parametro URL: `categoria`

URL:

```text
/blog?categoria=tennis
```

Risultato:

* filtro categoria = tennis

---

### Route Parameter

Configurazione:

* Campo target: categoria
* Modalità: Dynamic
* Parametro URL: `category`

URL:

```text
/blog/tennis
```

Risultato:

* filtro categoria = tennis

---

### Fallback

Configurazione:

* Campo target: categoria
* Modalità: Dynamic
* Parametro URL: `categoria`
* Fallback: featured

URL:

```text
/blog
```

Risultato:

* filtro categoria = featured

---

## Responsabilità del Frontend

Il frontend deve:

1. Leggere la configurazione del filtro.
2. Recuperare i parametri dell’URL.
3. Risolvere il valore finale seguendo le regole definite.
4. Applicare il filtro alla query di recupero dati.

---

## Benefici

* Configurazione completamente data-driven.
* Nessuna logica specifica per singole pagine.
* Supporto a query params e route params.
* Possibilità di fallback.
* Riutilizzabile per qualsiasi tipo di contenuto e filtro.
