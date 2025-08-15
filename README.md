# The-Fabled-Nexus

This will be my rising star. My child. My lover.

This will be my testament. The new and old.

This.

Will.

Be.

Glorious.

----------------------------
## Layout
I plan to utilize the Multiple Databases to One Application method as it allows me to use one database to store all of things Magic the Gathering related in one - and "Community" in the other.

## DB Schema

I want to utilize my databases as follows:

Database 1: This will be a stored source of information regarding the cards of magic. There will a read-only lock on this database as i only want the users to be able to see the cards. I do not want them to add any cards to this website - nor do i want them to edit any cards. These will be done by admins who have access to Database 1. 

Database 2: This will be a stored source of information regarding users, their friends, comments, decklists, and collections (WIP Buying Selling platform, Battle platform)
Here they can create decklists, test hands, create stored collections of cards currently owned, and review prices of cards with links TCGplayer and Card Kingdom.


## DB Schema Snippet

```
// Database: mtg_data_db 
//(Scryfall Mirror + Real-Time Prices)

Table cards {
  id uuid [pk]
  oracle_id uuid
  name varchar
  layout varchar
  lang varchar
  released_at date
  mana_cost varchar
  cmc numeric
  type_line varchar
  oracle_text text
  power varchar
  toughness varchar
  loyalty varchar
  colors varchar[]
  color_identity varchar[]
  keywords varchar[]
  rarity varchar
  set varchar
  set_name varchar
  collector_number varchar
  artist varchar
  flavor_text text
  image_uris jsonb
  scryfall_uri varchar
  multiverse_ids jsonb
  legalities jsonb
  prices jsonb [note: 'Snapshot from Scryfall']
  card_kingdom_price decimal [note: 'Real-time price']
  tcgplayer_price decimal [note: 'Real-time price']
  purchase_uris jsonb
  related_uris jsonb
  card_faces jsonb
  digital boolean
  foil boolean
  nonfoil boolean
  border_color varchar
  full_art boolean
  promo boolean
  oversized boolean
  reprint boolean
  variation boolean
  reserved boolean
  highres_image boolean
  last_updated timestamp [note: 'Timestamp for real-time prices']
}

Table legalities {
  card_id uuid
  format varchar
  legality varchar
}

Table card_faces {
  id uuid [pk]
  card_id uuid
  name varchar
  mana_cost varchar
  oracle_text text
  power varchar
  toughness varchar
}

Ref: legalities.card_id > cards.id
Ref: card_faces.card_id > cards.id




// Database: app_data_db 
//(Deckbuilding, Social, Collection)

Table users {
  id serial [pk]
  username varchar
  email varchar
  password_hash varchar
  role varchar
  created_at timestamp
  updated_at timestamp
}

Table friends {
  user_id int
  friend_id int
  status varchar [note: 'pending, accepted']
  requested_at timestamp
  accepted_at timestamp
}

Table decks {
  id serial [pk]
  user_id int [not null]
  name varchar
  description text
  created_at timestamp
  updated_at timestamp
}

Table deck_cards {
  id serial [pk]
  deck_id int [not null]
  card_id uuid [note: 'References mtg_data_db.cards.id']
  quantity int
  is_sideboard boolean
  created_at timestamp
  updated_at timestamp
}

Table comments {
  id serial [pk]
  user_id int [not null]
  card_id uuid [note: 'References mtg_data_db.cards.id']
  body text
  created_at timestamp
  updated_at timestamp
}

Table images {
  id serial [pk]
  user_id int
  card_id uuid
  image_url varchar
  uploaded_at timestamp
}

Table collection {
  id serial [pk]
  user_id int
  card_id uuid [note: 'References mtg_data_db.cards.id']
  quantity_owned int
  acquired_date date
  created_at timestamp
  updated_at timestamp
}

Ref: friends.user_id > users.id
Ref: friends.friend_id > users.id

Ref: decks.user_id > users.id
Ref: deck_cards.deck_id > decks.id

Ref: comments.user_id > users.id
Ref: images.user_id > users.id
Ref: collection.user_id > users.id

```

Scryfall uses a 128-but Unique Identifier. In schema - it is referenced as 'uuid'. 

-----------------------------


## Functionality


