//
// Central data store 
// és szerver kommunikáciő
//

const dataStore = {
  data:  {  // PATIONBETEG# formátuma szerinti sorrendben.
    taj: '',
    vNev: '',
    kNev: '',
    nem: '',
    szulIdo: '',
    szulOrszag: '',
    szulHely: '',
    anyjaNeve: '',
    lakcimOrsz: '',
    lakcimIrsz: '',
    lakcimHely: '',
    telefon: '',
    email: '',
    vakcina: '',
  },
  sent: true,

  parse(str) {
    // Adatfelodlgozás
    // string -> datastore
    const d = dataStore.data

    const dfield = str.split('#')
    console.log(dfield)

    if (dfield.length !== 3) 
      throw Error('Hibás QR kód adatok!')

    const fields = dfield[1].split('|')
    if (fields.length !== 14) 
      throw Error(`Hibás QR kód adatok! ${fields.length} mező 14 helyett.`)

    console.log(fields)

    dataStore.data = Object.fromEntries(Object.keys(d).map((k, i) => [k, fields[i]]))
    dataStore.sent = false
  },

  clear() {
    dataStore.data = Object.fromEntries(Object.keys(d).map(k => [k, '']))
  },
  
  async postData() {
    const url = 'https://api.szerver/végpont'

    if (dataStore.sent) return

    let resp 
    try {
      resp = await fetch(url, {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      })
    } catch (e) {
      console.error(e)
      throw Error('Kiszolgáló hiba!' + e)
    }

    if (!resp.ok)
      throw Error('Kiszolgáló hiba!' + resp.statusText)

    dataStore.sent = true
  },
}

// vim: set et sw=2 ts=2 :


