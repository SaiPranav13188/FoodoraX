'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import { AiAssistantModal } from '@/components/AiModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { OrderTrackerModal } from '@/components/OrderTrackerModal';

// --- DATA STRUCTURES ---
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: string;
  time: string;
  price: string;
  image: string;
  badge: string;
  menu: MenuItem[];
}

export interface Cuisine {
  id: string;
  name: string;
  image: string;
  restaurants: Restaurant[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantName?: string;
  isVeg?: boolean;
  description?: string;
}

// --- REALISTIC MENU DISHES DICTIONARY ---
const CUISINE_DISH_TEMPLATES: Record<string, { name: string; isVeg: boolean; desc: string; basePrice: number }[]> = {
  Italian: [
    { name: 'Margherita Pizza', isVeg: true, desc: 'Fresh mozzarella, San Marzano tomatoes, fresh basil, and extra virgin olive oil.', basePrice: 14.99 },
    { name: 'Spaghetti Carbonara', isVeg: false, desc: 'Classic Roman pasta with crispy guanciale, egg yolk, Pecorino Romano, and black pepper.', basePrice: 16.50 },
    { name: 'Truffle Mushroom Risotto', isVeg: true, desc: 'Arborio rice cooked with wild mushrooms, white truffle oil, and aged Parmesan.', basePrice: 18.00 },
    { name: 'Penne Alla Vodka', isVeg: true, desc: 'Penne tossed in a rich, creamy tomato vodka sauce with a touch of chili flakes.', basePrice: 15.25 },
    { name: 'Fettuccine Alfredo with Chicken', isVeg: false, desc: 'Handcrafted fettuccine tossed in rich garlic butter cream sauce with grilled chicken.', basePrice: 17.50 },
    { name: 'Lasagna Bolognese', isVeg: false, desc: 'Layered pasta sheets with slow-cooked beef ragù, béchamel, and melted mozzarella.', basePrice: 16.99 },
    { name: 'Bruschetta al Pomodoro', isVeg: true, desc: 'Toasted rustic bread topped with diced vine tomatoes, garlic, basil, and balsamic drizzle.', basePrice: 9.50 },
    { name: 'Chicken Parmesan', isVeg: false, desc: 'Breaded chicken breast topped with marinara sauce and melted provolone over spaghetti.', basePrice: 18.50 },
    { name: 'Gnocchi Sorrento', isVeg: true, desc: 'Soft potato gnocchi baked in tomato sauce, fresh basil, and molten mozzarella.', basePrice: 14.50 },
    { name: 'Tiramisu Classico', isVeg: true, desc: 'Traditional Italian dessert layered with ladyfingers, espresso, and mascarpone cream.', basePrice: 8.50 },
    { name: 'Cacio e Pepe', isVeg: true, desc: 'Simple perfection: Bucatini pasta, aged Pecorino Romano cheese, and freshly cracked black pepper.', basePrice: 13.99 },
    { name: 'Seafood Linguine', isVeg: false, desc: 'Linguine with fresh shrimp, clams, and calamari in a light white wine tomato broth.', basePrice: 22.00 },
    { name: 'Caprese Salad', isVeg: true, desc: 'Fresh heirloom tomatoes, buffalo mozzarella, basil leaves, and balsamic reduction.', basePrice: 11.50 },
    { name: 'Quattro Formaggi Pizza', isVeg: true, desc: 'Four-cheese white pizza with mozzarella, gorgonzola, fontina, and parmesan.', basePrice: 16.00 },
    { name: 'Prosciutto e Melone', isVeg: false, desc: 'Thinly sliced aged Parma ham paired with sweet ripe cantaloupe wedges.', basePrice: 12.50 },
    { name: 'Arancini di Riso', isVeg: true, desc: 'Crispy fried saffron rice balls stuffed with mozzarella and served with marinara.', basePrice: 10.00 },
    { name: 'Osso Buco', isVeg: false, desc: 'Tender braised veal shanks served over saffron risotto with gremolata.', basePrice: 26.00 },
    { name: 'Minestrone Soup', isVeg: true, desc: 'Hearty Italian vegetable soup with beans, ditalini pasta, and fresh herbs.', basePrice: 7.99 },
    { name: 'Panna Cotta', isVeg: true, desc: 'Chilled sweetened cream dessert topped with fresh raspberry coulis.', basePrice: 7.50 },
    { name: 'Cannoli Siciliani', isVeg: true, desc: 'Crispy pastry shells filled with sweet ricotta cheese and dark chocolate chips.', basePrice: 6.99 }
  ],
  Japanese: [
    { name: 'Salmon Lover Nigiri Set', isVeg: false, desc: 'Fresh Atlantic salmon over seasoned sushi rice with pickled ginger and wasabi.', basePrice: 18.50 },
    { name: 'Tonkotsu Pork Ramen', isVeg: false, desc: 'Rich 12-hour pork bone broth, tender chashu pork, bamboo shoots, and soft-boiled egg.', basePrice: 15.99 },
    { name: 'Spicy Tuna Roll', isVeg: false, desc: 'Fresh minced tuna mixed with spicy mayo, cucumber, and sesame seeds.', basePrice: 12.00 },
    { name: 'Vegetable Tempura Platter', isVeg: true, desc: 'Crispy light batter-fried seasonal vegetables served with savory dashi dipping sauce.', basePrice: 11.50 },
    { name: 'Chicken Teriyaki Bowl', isVeg: false, desc: 'Grilled chicken thigh glazed with sweet house teriyaki sauce over steamed rice.', basePrice: 13.99 },
    { name: 'Miso Ramen', isVeg: true, desc: 'Rich fermented soybean broth with sweet corn, tofu, scallions, and nori seaweed.', basePrice: 14.50 },
    { name: 'Dragon Roll', isVeg: false, desc: 'Eel and cucumber roll topped with sliced avocado, unagi sauce, and tobiko.', basePrice: 16.50 },
    { name: 'Edamame with Sea Salt', isVeg: true, desc: 'Steamed young soybeans sprinkled with coarse Himalayan pink sea salt.', basePrice: 5.99 },
    { name: 'Beef Gyudon Bowl', isVeg: false, desc: 'Thinly sliced beef and onions simmered in sweet dashi soy sauce over rice.', basePrice: 14.00 },
    { name: 'Chicken Katsu Curry', isVeg: false, desc: 'Crispy panko-breaded chicken cutlet with fragrant Japanese curry and rice.', basePrice: 15.50 },
    { name: 'Agedashi Tofu', isVeg: true, desc: 'Deep-fried silken tofu served in hot dashi broth with grated daikon radish.', basePrice: 8.50 },
    { name: 'Sashimi Combo Deluxe', isVeg: false, desc: '15 pieces of assorted chef-selected raw fish (Salmon, Tuna, Yellowtail).', basePrice: 28.00 },
    { name: 'Avocado & Cucumber Roll', isVeg: true, desc: 'Fresh sliced avocado and crisp cucumber wrapped in nori and sushi rice.', basePrice: 7.50 },
    { name: 'Takoyaki Balls', isVeg: false, desc: 'Fried octopus batter spheres topped with takoyaki sauce, mayo, and bonito flakes.', basePrice: 9.50 },
    { name: 'Matcha Green Tea Cake', isVeg: true, desc: 'Layered crepe cake infused with premium Uji matcha tea cream.', basePrice: 8.00 },
    { name: 'Yakitori Skewers', isVeg: false, desc: 'Grilled chicken skewers seasoned with tare sauce and shichimi pepper.', basePrice: 9.99 },
    { name: 'Seaweed Salad (Goma Wakame)', isVeg: true, desc: 'Seasoned seaweed salad with sesame oil, vinegar, and toasted sesame seeds.', basePrice: 6.50 },
    { name: 'Unagi Don', isVeg: false, desc: 'Grilled freshwater eel over steamed rice topped with rich sweet eel glaze.', basePrice: 21.00 },
    { name: 'Gyoza Pork Dumplings', isVeg: false, desc: 'Pan-fried Japanese dumplings packed with minced pork and scallions.', basePrice: 8.99 },
    { name: 'Mochi Ice Cream Trio', isVeg: true, desc: 'Soft rice dough stuffed with green tea, mango, and strawberry ice creams.', basePrice: 6.99 }
  ],
  Mexican: [
    { name: 'Street Tacos al Pastor', isVeg: false, desc: 'Marinated pork roasted on a vertical spit, pineapple, cilantro, and diced onions.', basePrice: 11.99 },
    { name: 'Carne Asada Burrito', isVeg: false, desc: 'Grilled flank steak, Mexican rice, pinto beans, guacamole, and fresh pico de gallo.', basePrice: 13.50 },
    { name: 'Vegetarian Enchiladas', isVeg: true, desc: 'Corn tortillas stuffed with roasted corn, black beans, smothered in green salsa verde.', basePrice: 12.99 },
    { name: 'Fresh Guacamole & Chips', isVeg: true, desc: 'Hand-mashed hass avocados, lime juice, cilantro, tomato, served with warm tortilla chips.', basePrice: 8.99 },
    { name: 'Quesabirria Tacos', isVeg: false, desc: 'Slow-braised beef birria with melted cheese in crispy corn tortillas with consommé dip.', basePrice: 15.00 },
    { name: 'Chicken Fajita Platter', isVeg: false, desc: 'Sizzling chicken strips, bell peppers, onions, sour cream, and warm tortillas.', basePrice: 16.50 },
    { name: 'Chiles Rellenos', isVeg: true, desc: 'Poblano peppers stuffed with queso fresco, battered and fried in spiced tomato sauce.', basePrice: 14.00 },
    { name: 'Elote (Mexican Street Corn)', isVeg: true, desc: 'Grilled corn on the cob coated with cotija cheese, mayo, chili powder, and lime.', basePrice: 5.50 },
    { name: 'Nachos Supreme', isVeg: true, desc: 'Tortilla chips topped with melted cheese, jalapenos, sour cream, guacamole, and salsa.', basePrice: 11.00 },
    { name: 'Churros with Chocolate Dip', isVeg: true, desc: 'Fried cinnamon-sugar pastry sticks served with rich warm Mexican chocolate sauce.', basePrice: 6.99 },
    { name: 'Carnitas Bowl', isVeg: false, desc: 'Slow-cooked crispy pork carnitas served with cilantro-lime rice and black beans.', basePrice: 13.99 },
    { name: 'Fish Tacos Baja Style', isVeg: false, desc: 'Beer-battered cod, chipotle crema, cabbage slaw, and fresh lime in soft corn tortillas.', basePrice: 14.50 },
    { name: 'Tostadas de Camaron', isVeg: false, desc: 'Crispy tostada shells topped with citrus-marinated shrimp ceviche and avocado.', basePrice: 13.00 },
    { name: 'Black Bean Soup', isVeg: true, desc: 'Creamy spiced black bean soup topped with queso fresco and crispy tortilla strips.', basePrice: 7.00 },
    { name: 'Flautas de Pollo', isVeg: false, desc: 'Rolled crispy corn tortillas filled with shredded chicken, lettuce, and sour cream.', basePrice: 10.50 },
    { name: 'Tamales de Queso y Jalapeño', isVeg: true, desc: 'Steamed corn masa filled with Monterey Jack cheese and pickled jalapeños.', basePrice: 9.00 },
    { name: 'Tres Leches Cake', isVeg: true, desc: 'Authentic moist sponge cake soaked in three types of sweet milk.', basePrice: 7.50 },
    { name: 'Torta Ahogada', isVeg: false, desc: 'Pork sandwich served on crusty bread submerged in spicy red chili sauce.', basePrice: 12.50 },
    { name: 'Quesadilla de Queso', isVeg: true, desc: 'Large flour tortilla filled with melted Oaxaca cheese and served with salsa.', basePrice: 9.50 },
    { name: 'Horchata Beverage', isVeg: true, desc: 'Refreshing traditional sweet rice milk spiced with cinnamon and vanilla.', basePrice: 4.50 }
  ],
  American: [
    { name: 'Classic Bacon Cheeseburger', isVeg: false, desc: 'Angus beef patty, crispy bacon, cheddar, lettuce, tomato, and secret burger sauce.', basePrice: 13.99 },
    { name: 'Beyond Meat Veggie Burger', isVeg: true, desc: 'Plant-based patty with vegan cheddar, avocado, tomato, and garlic aioli on a brioche bun.', basePrice: 14.50 },
    { name: 'Buffalo Chicken Wings', isVeg: false, desc: 'Crispy wings tossed in spicy buffalo sauce, served with celery and blue cheese dip.', basePrice: 12.99 },
    { name: 'BBQ Pulled Pork Sandwich', isVeg: false, desc: 'Slow-smoked pulled pork tossed in tangy hickory BBQ sauce topped with coleslaw.', basePrice: 13.50 },
    { name: 'Loaded Macaroni & Cheese', isVeg: true, desc: 'Elbow macaroni tossed in four-cheese sauce topped with toasted breadcrumbs.', basePrice: 11.50 },
    { name: 'Philly Cheesesteak', isVeg: false, desc: 'Thinly sliced ribeye steak, melted provolone cheese, sautéed onions on a hoagie roll.', basePrice: 14.99 },
    { name: 'Crispy French Fries', isVeg: true, desc: 'Golden skin-on potato fries lightly salted and served with house ketchup.', basePrice: 4.99 },
    { name: 'Southern Fried Chicken Tender Box', isVeg: false, desc: 'Hand-battered chicken tenders served with honey mustard and seasoned fries.', basePrice: 12.50 },
    { name: 'New England Clam Chowder', isVeg: false, desc: 'Rich creamy chowder with fresh clams, tender potatoes, and smoky bacon bits.', basePrice: 8.99 },
    { name: 'Cobb Salad', isVeg: false, desc: 'Grilled chicken, avocado, hard-boiled egg, bacon, tomatoes, and blue cheese crumble.', basePrice: 13.00 },
    { name: 'Onion Rings', isVeg: true, desc: 'Thick-cut onion rings dipped in batter and fried till golden brown.', basePrice: 6.50 },
    { name: 'BBQ Baby Back Ribs (Half Rack)', isVeg: false, desc: 'Fall-off-the-bone tender ribs brushed with sweet smoked barbecue sauce.', basePrice: 19.99 },
    { name: 'Grilled Cheese Sandwich', isVeg: true, desc: 'Melted sharp cheddar and Swiss cheese between buttered toasted sourdough.', basePrice: 8.50 },
    { name: 'New York Cheesecake', isVeg: true, desc: 'Dense rich cheesecake with a graham cracker crust and strawberry topping.', basePrice: 7.99 },
    { name: 'Smash Burger (Double)', isVeg: false, desc: 'Two thin smashed beef patties, double American cheese, pickles, and grilled onions.', basePrice: 12.00 },
    { name: 'Sweet Potato Fries', isVeg: true, desc: 'Crispy sweet potato fries served with chipotle dipping sauce.', basePrice: 5.99 },
    { name: 'Hot Dog Loaded', isVeg: false, desc: 'All-beef frankfurter topped with relish, diced onions, mustard, and ketchup.', basePrice: 7.50 },
    { name: 'Warm Apple Pie', isVeg: true, desc: 'Classic cinnamon-spiced apple pie slice served with vanilla bean ice cream.', basePrice: 6.99 },
    { name: 'Milkshake (Chocolate/Vanilla)', isVeg: true, desc: 'Thick hand-spun ice cream milkshake topped with whipped cream and a cherry.', basePrice: 5.99 },
    { name: 'BLT Sandwich', isVeg: false, desc: 'Crispy bacon, fresh lettuce, sliced tomatoes, and mayonnaise on toasted white bread.', basePrice: 9.99 }
  ],
  Indian: [
    { name: 'Butter Chicken (Murgh Makhani)', isVeg: false, desc: 'Tender chicken marinated in spiced yogurt cooked in a rich, buttery tomato cream sauce.', basePrice: 15.99 },
    { name: 'Paneer Butter Masala', isVeg: true, desc: 'Cubes of cottage cheese cooked in a smooth, creamy tomato and cashew gravy.', basePrice: 14.50 },
    { name: 'Garlic Butter Naan', isVeg: true, desc: 'Traditional oven-baked flatbread topped with fresh garlic and melted butter.', basePrice: 3.99 },
    { name: 'Chicken Biryani', isVeg: false, desc: 'Fragrant basmati rice layered with spiced chicken, mint, saffron, and fried onions.', basePrice: 16.99 },
    { name: 'Vegetable Samosas (2 pcs)', isVeg: true, desc: 'Crispy pastry shells stuffed with spiced potatoes and green peas.', basePrice: 5.50 },
    { name: 'Chana Masala', isVeg: true, desc: 'Chickpeas cooked in a tangy onion-tomato gravy with aromatic North Indian spices.', basePrice: 12.99 },
    { name: 'Lamb Vindaloo', isVeg: false, desc: 'Fiery hot curry with tender lamb chunks, braised with vinegar and ground red chillies.', basePrice: 18.00 },
    { name: 'Dal Makhani', isVeg: true, desc: 'Slow-cooked black lentils and kidney beans simmered overnight with cream and butter.', basePrice: 13.50 },
    { name: 'Palak Paneer', isVeg: true, desc: 'Fresh spinach puree cooked with Indian cottage cheese and mild spices.', basePrice: 14.00 },
    { name: 'Tandoori Chicken (Half)', isVeg: false, desc: 'Chicken marinated in yogurt and spices roasted to perfection in a clay oven.', basePrice: 15.00 },
    { name: 'Aloo Gobi', isVeg: true, desc: 'Potato and cauliflower florets sautéed with turmeric, ginger, and spices.', basePrice: 12.50 },
    { name: 'Chicken Tikka Masala', isVeg: false, desc: 'Roasted marinated chicken chunks in a spiced, orange-colored curry sauce.', basePrice: 16.50 },
    { name: 'Vegetable Biryani', isVeg: true, desc: 'Aromatic basmati rice cooked with mixed vegetables and Indian herbs.', basePrice: 14.00 },
    { name: 'Gulab Jamun (2 pcs)', isVeg: true, desc: 'Soft milk solids dumplings fried and soaked in warm rose-flavored sugar syrup.', basePrice: 4.99 },
    { name: 'Mango Lassi', isVeg: true, desc: 'Refreshing sweet yogurt drink blended with ripe Alphonso mango pulp.', basePrice: 4.50 },
    { name: 'Onion Bhaji', isVeg: true, desc: 'Crispy fried onion fritters bound with chickpea flour and ground spices.', basePrice: 6.99 },
    { name: 'Rogan Josh (Beef/Lamb)', isVeg: false, desc: 'Kashmiri aromatic lamb dish braised with gravy of onions, yogurt, and garlic.', basePrice: 18.50 },
    { name: 'Roti / Chapati', isVeg: true, desc: 'Unleavened whole wheat flatbread baked on a hot tawa griddle.', basePrice: 2.50 },
    { name: 'Malai Kofta', isVeg: true, desc: 'Fried paneer and potato dumplings served in a rich creamy cashew curry.', basePrice: 15.00 },
    { name: 'Rasgulla', isVeg: true, desc: 'Spongy chhena cottage cheese balls soaked in clear light sugar syrup.', basePrice: 4.99 }
  ],
  Chinese: [
    { name: 'Kung Pao Chicken', isVeg: false, desc: 'Diced chicken wok-tossed with peanuts, vegetables, and chili peppers.', basePrice: 14.50 },
    { name: 'Vegetable Chow Mein', isVeg: true, desc: 'Stir-fried egg noodles with cabbage, carrots, bean sprouts, and soy sauce.', basePrice: 12.00 },
    { name: 'Sweet & Sour Pork', isVeg: false, desc: 'Crispy pork chunks coated with sweet pineapple, bell peppers, and tangy red sauce.', basePrice: 14.99 },
    { name: 'Dim Sum Pork Dumplings (Siu Mai)', isVeg: false, desc: 'Steamed open-topped dumplings filled with seasoned pork and shrimp.', basePrice: 8.99 },
    { name: 'Mapo Tofu', isVeg: true, desc: 'Sichuan braised tofu served in a spicy chili bean sauce topped with Sichuan pepper.', basePrice: 12.50 },
    { name: 'Beef with Broccoli', isVeg: false, desc: 'Tender flank steak stir-fried with fresh broccoli florets in garlic soy sauce.', basePrice: 15.50 },
    { name: 'Peking Duck Wraps', isVeg: false, desc: 'Crispy roasted duck skin and meat served with cucumbers, scallions, and plum sauce.', basePrice: 22.00 },
    { name: 'Vegetable Spring Rolls (3 pcs)', isVeg: true, desc: 'Crispy golden rolls filled with shredded cabbage, carrots, and glass noodles.', basePrice: 6.50 },
    { name: 'Yangzhou Fried Rice', isVeg: false, desc: 'Wok-fried rice with shrimp, barbecue pork, green peas, and fluffy scrambled egg.', basePrice: 13.50 },
    { name: 'Hot & Sour Soup', isVeg: true, desc: 'Traditional Sichuan soup with tofu, wood ear mushrooms, bamboo shoots, and vinegar.', basePrice: 6.99 },
    { name: 'General Tso\'s Chicken', isVeg: false, desc: 'Deep-fried chicken pieces coated in a sweet and spicy dark sauce.', basePrice: 14.99 },
    { name: 'Honey Sesame Chicken', isVeg: false, desc: 'Crispy chicken breast bites glazed in sweet honey sauce sprinkled with sesame.', basePrice: 14.50 },
    { name: 'Wonton Soup', isVeg: false, desc: 'Pork and shrimp wontons served in a clear chicken broth with scallions.', basePrice: 7.50 },
    { name: 'Stir-fried Bok Choy', isVeg: true, desc: 'Fresh green baby bok choy sauteed with minced garlic and light soy sauce.', basePrice: 9.99 },
    { name: 'Dan Dan Noodles', isVeg: false, desc: 'Spicy noodles in sesame peanut sauce topped with minced pork and chili oil.', basePrice: 13.00 },
    { name: 'Orange Beef', isVeg: false, desc: 'Crispy sliced beef cooked with sweet and tangy real orange peel glaze.', basePrice: 16.00 },
    { name: 'Scallion Pancakes', isVeg: true, desc: 'Flaky pan-fried flatbread layered with minced green scallions.', basePrice: 6.00 },
    { name: 'Egg Drop Soup', isVeg: true, desc: 'Wispy beaten eggs in boiled sweet corn chicken broth.', basePrice: 5.50 },
    { name: 'Egg Tarts (2 pcs)', isVeg: true, desc: 'Cantonese baked flaky pastry crust filled with sweet egg custard cream.', basePrice: 5.00 },
    { name: 'Fried Sesame Balls', isVeg: true, desc: 'Crispy chewy glutinous rice balls coated in sesame seeds and stuffed with red bean paste.', basePrice: 5.50 }
  ],
  Peruvian: [
    { name: 'Ceviche Classico', isVeg: false, desc: 'Fresh white fish cured in key lime juice with red onions, rocoto pepper, sweet potato, and corn.', basePrice: 17.50 },
    { name: 'Lomo Saltado', isVeg: false, desc: 'Stir-fried beef tenderloin strips, onions, tomatoes, and french fries served with rice.', basePrice: 18.99 },
    { name: 'Aji de Gallina', isVeg: false, desc: 'Shredded chicken in a rich, velvety yellow chili cheese sauce served over sliced potatoes.', basePrice: 15.50 },
    { name: 'Causa Rellena de Pollo', isVeg: true, desc: 'Layered yellow potato terrine seasoned with lime and yellow pepper, stuffed with avocado.', basePrice: 12.00 },
    { name: 'Arroz con Mariscos', isVeg: false, desc: 'Peruvian-style seafood rice cooked with white wine, yellow pepper, shrimp, and squid.', basePrice: 19.50 },
    { name: 'Papa a la Huancaína', isVeg: true, desc: 'Sliced boiled potatoes covered in a creamy spicy yellow pepper cheese sauce.', basePrice: 9.50 },
    { name: 'Pollo a la Brasa (Half)', isVeg: false, desc: 'Peruvian roasted rotisserie chicken seasoned with spices, served with fries and green sauce.', basePrice: 16.00 },
    { name: 'Anticuchos de Corazon', isVeg: false, desc: 'Grilled marinated beef heart skewers served with roasted potatoes and choclo corn.', basePrice: 13.50 },
    { name: 'Seco de Res', isVeg: false, desc: 'Tender beef stew braised in cilantro, garlic, and chicha de jora served with beans.', basePrice: 17.00 },
    { name: 'Tacu Tacu con Filete', isVeg: false, desc: 'Pan-seared rice and bean patty topped with a juicy grilled sirloin steak.', basePrice: 18.00 },
    { name: 'Chicha Morada Beverage', isVeg: true, desc: 'Traditional purple corn drink boiled with pineapple, apples, cinnamon, and cloves.', basePrice: 4.50 },
    { name: 'Alfajores (3 pcs)', isVeg: true, desc: 'Delicate melt-in-your-mouth shortbread cookies filled with dulce de leche.', basePrice: 5.99 },
    { name: 'Empanada de Carne', isVeg: false, desc: 'Baked pastry stuffed with spiced ground beef, raisins, olives, and hard-boiled egg.', basePrice: 4.99 },
    { name: 'Tiradito de Pescado', isVeg: false, desc: 'Thinly sliced raw fish coated with spicy yellow chili cream without onions.', basePrice: 16.50 },
    { name: 'Arroz Chaufa de Verduras', isVeg: true, desc: 'Peruvian-Chinese fusion fried rice loaded with crisp vegetables and ginger.', basePrice: 12.50 },
    { name: 'Sopa a la Criolla', isVeg: false, desc: 'Hearty soup with ground beef, angel hair pasta, milk, and topped with a fried egg.', basePrice: 11.50 },
    { name: 'Yuquitas Fritas', isVeg: true, desc: 'Crispy fried cassava yucca roots served with huancaina dipping sauce.', basePrice: 7.00 },
    { name: 'Tamal Criollo', isVeg: false, desc: 'White corn masa stuffed with pork, peanuts, and chili wrapped in banana leaves.', basePrice: 8.00 },
    { name: 'Suspiro a la Limeña', isVeg: true, desc: 'Sweet caramel caramel dessert pudding topped with port wine meringue and cinnamon.', basePrice: 6.50 },
    { name: 'Pisco Sour (Non-Alcoholic)', isVeg: true, desc: 'Lime juice, simple syrup, egg white, and bitters shaken into a frothy Mocktail.', basePrice: 6.99 }
  ],
  Greek: [
    { name: 'Classic Greek Salad (Horiatiki)', isVeg: true, desc: 'Vine tomatoes, cucumbers, kalamata olives, red onions, and a slab of feta with oregano.', basePrice: 12.50 },
    { name: 'Traditional Chicken Souvlaki', isVeg: false, desc: 'Grilled marinated chicken skewers served with pita bread, tzatziki, and Greek fries.', basePrice: 14.99 },
    { name: 'Beef & Lamb Gyro Wrap', isVeg: false, desc: 'Seasoned rotisserie gyro meat tucked in warm pita with lettuce, tomatoes, and tzatziki.', basePrice: 11.99 },
    { name: 'Moussaka', isVeg: false, desc: 'Layered casserole of eggplant, spiced minced beef, potatoes, topped with creamy béchamel.', basePrice: 16.50 },
    { name: 'Spanakopita (Spinach Pie)', isVeg: true, desc: 'Flaky phyllo pastry filled with fresh spinach, feta cheese, and herbs.', basePrice: 9.50 },
    { name: 'Hummus & Warm Pita', isVeg: true, desc: 'Creamy chickpea dip with tahini, olive oil, paprika, served with toasted pita points.', basePrice: 7.99 },
    { name: 'Baklava', isVeg: true, desc: 'Layers of golden phyllo dough packed with chopped walnuts and sweet honey syrup.', basePrice: 6.50 },
    { name: 'Tzatziki Dip with Pita', isVeg: true, desc: 'Strained Greek yogurt mixed with cucumbers, garlic, dill, and olive oil.', basePrice: 6.99 },
    { name: 'Dolmades (Stuffed Grape Leaves)', isVeg: true, desc: 'Grape leaves stuffed with rice, fresh herbs, lemon juice, and olive oil.', basePrice: 8.50 },
    { name: 'Falafel Pita Sandwich', isVeg: true, desc: 'Crispy chickpea falafel balls wrapped in pita with tahini sauce and salad.', basePrice: 10.50 },
    { name: 'Grilled Octopus', isVeg: false, desc: 'Char-grilled octopus tentacle drizzled with olive oil, lemon, and capers.', basePrice: 19.99 },
    { name: 'Pastitsio', isVeg: false, desc: 'Baked pasta dish with ground meat gravy and creamy béchamel topping.', basePrice: 15.50 },
    { name: 'Saganaki (Fried Cheese)', isVeg: true, desc: 'Pan-fried kefalotyri cheese flamed with lemon juice served piping hot.', basePrice: 10.00 },
    { name: 'Greek Lemon Potatoes', isVeg: true, desc: 'Oven-roasted potato wedges steeped in lemon juice, garlic, and oregano.', basePrice: 5.99 },
    { name: 'Lamb Chops (Paidakia)', isVeg: false, desc: 'Charcoal-grilled tender lamb chops seasoned with sea salt and rosemary.', basePrice: 22.50 },
    { name: 'Kalamari Fritters', isVeg: false, desc: 'Crispy tender fried squid rings served with garlic lemon dipping sauce.', basePrice: 13.50 },
    { name: 'Tiropita (Cheese Pie)', isVeg: true, desc: 'Crispy phyllo triangles stuffed with a rich blend of feta and ricotta cheese.', basePrice: 8.99 },
    { name: 'Loukoumades (Greek Donuts)', isVeg: true, desc: 'Fried honey dough balls sprinkled with cinnamon and crushed walnuts.', basePrice: 6.99 },
    { name: 'Feta Psiti (Baked Feta)', isVeg: true, desc: 'Feta cheese baked with tomatoes, peppers, chili flakes, and olive oil.', basePrice: 9.00 },
    { name: 'Greek Yogurt with Honey & Nuts', isVeg: true, desc: 'Thick authentic Greek yogurt topped with wild thyme honey and walnuts.', basePrice: 5.50 }
  ]
};

const CUISINE_NAMES = [
  { name: 'Italian', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Japanese', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mexican', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80' },
  { name: 'American', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Indian', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80' },
  { name: 'Chinese', img: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Peruvian', img: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Greek', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
];

const generateMenu = (cuisineName: string, restoIndex: number): MenuItem[] => {
  const dishes = CUISINE_DISH_TEMPLATES[cuisineName] || [];
  return dishes.map((dish, i) => ({
    id: `item-${cuisineName}-${restoIndex}-${i + 1}`,
    name: dish.name,
    price: Number((dish.basePrice + (restoIndex % 3) * 0.50).toFixed(2)),
    isVeg: dish.isVeg,
    description: dish.desc
  }));
};

const CUISINES_DATA: Cuisine[] = CUISINE_NAMES.map((c, cIdx) => ({
  id: `c-${cIdx + 1}`,
  name: c.name,
  image: c.img,
  restaurants: Array.from({ length: 10 }, (_, rIdx) => ({
    id: `r-${cIdx + 1}-${rIdx + 1}`,
    name: `${c.name} ${rIdx === 0 ? 'Bistro' : rIdx === 1 ? 'Palace' : 'Kitchen'} ${rIdx + 1}`,
    rating: `${(4.2 + (rIdx % 8) * 0.1).toFixed(1)} ★`,
    time: `${15 + rIdx * 2}-${25 + rIdx * 2} min`,
    price: rIdx % 2 === 0 ? '$$' : '$$$',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    badge: rIdx % 3 === 0 ? '10% OFF' : rIdx % 3 === 1 ? 'Free Delivery' : 'Top Rated',
    menu: generateMenu(c.name, rIdx + 1)
  }))
}));

const FILTER_OPTIONS = [
  '⚡ Fastest Delivery',
  '★ Top Rated',
  '🔥 Flash Deals',
  '🌱 Vegan / Healthy',
  '💳 Under $15'
];

export default function Home() {
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Authentication User State
  const [user, setUser] = useState<any>(null);

  // Modal states for Checkout, Order Confirmation & Order Tracking
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Load cart and authenticated user from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('food_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart state:', err);
      }
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse user state:', err);
      }
    }

    setIsLoaded(true);
  }, []);

  // Sync cart changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('food_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Reset selections when clearing search or selecting top categories
  const resetSelection = () => {
    setSelectedCuisine(null);
    setSelectedRestaurant(null);
    setActiveFilter(null);
    setSearchQuery('');
  };

  // Handler: Add to cart
  const handleAddToCart = (item: { id: string; name: string; price: number; restaurantName?: string; isVeg?: boolean; description?: string }) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { ...item, quantity: 1, restaurantName: item.restaurantName || 'AI Recommendation' }];
    });
  };

  // Handler: Remove or decrement
  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
      setSelectedCuisine(null);
      setSelectedRestaurant(null);
    }
  };

  const handleOrderSuccess = (orderId: string) => {
    setCompletedOrderId(orderId);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCartItems([]);
    localStorage.removeItem('food_cart');
    setIsSuccessModalOpen(true);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Search Results Computation
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    
    const matchedRestaurants: { cuisineName: string; restaurant: Restaurant }[] = [];
    const matchedItems: { cuisineName: string; restaurantName: string; item: MenuItem }[] = [];

    CUISINES_DATA.forEach((cuisine) => {
      cuisine.restaurants.forEach((resto) => {
        if (resto.name.toLowerCase().includes(query) || cuisine.name.toLowerCase().includes(query)) {
          matchedRestaurants.push({ cuisineName: cuisine.name, restaurant: resto });
        }
        resto.menu.forEach((item) => {
          if (item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) {
            matchedItems.push({ cuisineName: cuisine.name, restaurantName: resto.name, item });
          }
        });
      });
    });

    return { matchedRestaurants, matchedItems };
  }, [searchQuery]);

  // Helper functions for aggregate filters
  const getFilteredRestaurants = () => {
    const list: { cuisineName: string; restaurant: Restaurant }[] = [];
    CUISINES_DATA.forEach((cuisine) => {
      cuisine.restaurants.forEach((resto) => {
        const ratingVal = parseFloat(resto.rating);
        const minTime = parseInt(resto.time.split('-')[0], 10);

        if (activeFilter === '★ Top Rated' && ratingVal >= 4.6) {
          list.push({ cuisineName: cuisine.name, restaurant: resto });
        } else if (activeFilter === '⚡ Fastest Delivery' && minTime <= 20) {
          list.push({ cuisineName: cuisine.name, restaurant: resto });
        } else if (activeFilter === '🔥 Flash Deals' && resto.badge !== 'Top Rated') {
          list.push({ cuisineName: cuisine.name, restaurant: resto });
        }
      });
    });
    return list;
  };

  const getFilteredMenuItems = () => {
    const list: { cuisineName: string; restaurantName: string; item: MenuItem }[] = [];
    CUISINES_DATA.forEach((cuisine) => {
      cuisine.restaurants.forEach((resto) => {
        resto.menu.forEach((item) => {
          if (activeFilter === '🌱 Vegan / Healthy' && item.isVeg) {
            list.push({ cuisineName: cuisine.name, restaurantName: resto.name, item });
          } else if (activeFilter === '💳 Under $15' && item.price < 15) {
            list.push({ cuisineName: cuisine.name, restaurantName: resto.name, item });
          }
        });
      });
    });
    return list;
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0D0D11', color: '#F3F4F6', padding: '16px', position: 'relative', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={resetSelection}
          >
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #FF5A36 0%, #FFB800 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(255, 90, 54, 0.4)'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px', margin: 0 }}>
              Foodora<span style={{ color: '#FF5A36' }}>X</span>
            </h1>
          </div>

          {/* Action Buttons Header Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: '#1E1E24',
                border: '1px solid #2E2E38',
                color: '#F3F4F6',
                fontWeight: '600',
                fontSize: '13px',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <span>📦</span>
              <span style={{ display: 'inline-block' }}>Orders</span>
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px', 
                height: '40px', 
                borderRadius: '12px',
                backgroundColor: '#1E1E24',
                border: '1px solid #2E2E38',
                fontSize: '18px',
                cursor: 'pointer',
              }}
              aria-label="View Cart"
            >
              🛍️
              {totalCartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#FF5A36',
                  color: '#FFF',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsAiOpen(true)}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: '#1E1E24',
                border: '1px solid #FFB800',
                color: '#FFB800',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(255, 184, 0, 0.15)',
              }}
            >
              <span>✨</span>
              <span>AI</span>
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  backgroundColor: '#1E1E24', 
                  border: '1px solid #2E2E38', 
                  borderRadius: '12px', 
                  padding: '8px 10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  <span>👤</span>
                  <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: '#2E2E38',
                    color: '#9CA3AF',
                    border: 'none',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#0D0D11',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
          <input
            type="text"
            suppressHydrationWarning
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search food, dishes, or restaurants..."
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#1E1E24',
              border: '1px solid #2E2E38',
              borderRadius: '12px',
              color: '#FFFFFF',
              outline: 'none',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '12px 16px',
                backgroundColor: '#2E2E38',
                color: '#9CA3AF',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '24px', 
        overflowX: 'auto', 
        paddingBottom: '8px',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'thin',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {FILTER_OPTIONS.map((filter, index) => {
          const isActive = activeFilter === filter;
          return (
            <button 
              key={index} 
              onClick={() => handleFilterClick(filter)}
              style={{ 
                padding: '10px 18px', 
                borderRadius: '20px', 
                backgroundColor: isActive ? '#FF5A36' : '#1E1E24', 
                border: `1px solid ${isActive ? '#FF5A36' : '#2E2E38'}`, 
                color: '#fff', 
                fontSize: '13px', 
                fontWeight: isActive ? 'bold' : '500',
                cursor: 'pointer', 
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 12px rgba(255, 90, 54, 0.3)' : 'none'
              }}
            >
              {filter} {isActive && ' ✕'}
            </button>
          );
        })}
      </div>

      {/* Breadcrumb Navigation */}
      {(selectedCuisine || selectedRestaurant || activeFilter || searchQuery) && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', color: '#9CA3AF', flexWrap: 'wrap' }}>
          <span 
            style={{ cursor: 'pointer', color: '#FF5A36', fontWeight: 'bold' }} 
            onClick={resetSelection}
          >
            All Cuisines
          </span>
          {searchQuery && (
            <>
              <span>/</span>
              <span style={{ color: '#FFF', fontWeight: 'bold' }}>Search: &quot;{searchQuery}&quot;</span>
            </>
          )}
          {!searchQuery && activeFilter && (
            <>
              <span>/</span>
              <span style={{ color: '#FFF', fontWeight: 'bold' }}>Filter: {activeFilter}</span>
            </>
          )}
          {!searchQuery && !activeFilter && selectedCuisine && (
            <>
              <span>/</span>
              <span 
                style={{ cursor: selectedRestaurant ? 'pointer' : 'default', color: selectedRestaurant ? '#FF5A36' : '#FFF', fontWeight: 'bold' }} 
                onClick={() => setSelectedRestaurant(null)}
              >
                {selectedCuisine.name}
              </span>
            </>
          )}
          {!searchQuery && !activeFilter && selectedRestaurant && (
            <>
              <span>/</span>
              <span style={{ color: '#FFF', fontWeight: 'bold' }}>{selectedRestaurant.name}</span>
            </>
          )}
        </div>
      )}

      {/* Search Results Display */}
      {searchResults && (
        <section style={{ width: '100%' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '16px' }}>
            Search Results for &quot;{searchQuery}&quot;
          </h3>

          {searchResults.matchedRestaurants.length === 0 && searchResults.matchedItems.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFF' }}>No matching items or restaurants found</p>
              <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>Try searching for a different dish, cuisine, or restaurant name.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {searchResults.matchedRestaurants.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '18px', color: '#FFB800', marginBottom: '12px' }}>Matching Restaurants</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {searchResults.matchedRestaurants.map(({ cuisineName, restaurant }) => (
                      <div 
                        key={restaurant.id} 
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setSearchQuery('');
                        }}
                        style={{ backgroundColor: '#1E1E24', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2E2E38', display: 'flex', gap: '16px', padding: '16px', cursor: 'pointer' }}
                      >
                        <div style={{ width: '100px', height: '100px', position: 'relative', flexShrink: 0 }}>
                          <img src={restaurant.image} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                          <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#FF5A36', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '4px' }}>
                            {cuisineName}
                          </span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{restaurant.name}</h4>
                            <span style={{ color: '#FFB800', fontWeight: 'bold', fontSize: '13px' }}>{restaurant.rating}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>
                            <span>⏱️ {restaurant.time}</span>
                            <span>•</span>
                            <span>{restaurant.price}</span>
                          </div>
                          <span style={{ color: '#FF5A36', fontSize: '12px', fontWeight: 'bold' }}>View Menu →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.matchedItems.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '18px', color: '#FFB800', marginBottom: '12px' }}>Matching Menu Dishes</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
                    {searchResults.matchedItems.map(({ cuisineName, restaurantName, item }) => (
                      <div key={item.id} style={{ backgroundColor: '#1E1E24', borderRadius: '16px', padding: '18px', border: '1px solid #2E2E38', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '11px', color: '#FFB800' }}>
                            <span>{cuisineName}</span>
                            <span>•</span>
                            <span>{restaurantName}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ 
                              width: '16px', 
                              height: '16px', 
                              border: `1.5px solid ${item.isVeg ? '#10B981' : '#EF4444'}`, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              borderRadius: '3px',
                              flexShrink: 0
                            }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.isVeg ? '#10B981' : '#EF4444' }} />
                            </div>
                            <h5 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#FFF' }}>{item.name}</h5>
                          </div>
                          <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '0 0 10px 0', lineHeight: '1.4' }}>{item.description}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFB800' }}>${item.price.toFixed(2)}</span>
                          <button 
                            onClick={() => handleAddToCart({ ...item, restaurantName })}
                            style={{ 
                              padding: '8px 14px', 
                              backgroundColor: '#FF5A36', 
                              color: '#FFF', 
                              border: 'none', 
                              borderRadius: '10px', 
                              fontWeight: 'bold', 
                              fontSize: '12px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              boxShadow: '0 0 10px rgba(255, 90, 54, 0.3)'
                            }}
                          >
                            + Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Filter View: Restaurant Results */}
      {!searchQuery && activeFilter && ['★ Top Rated', '⚡ Fastest Delivery', '🔥 Flash Deals'].includes(activeFilter) && (
        <section style={{ width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF' }}>{activeFilter} Restaurants across Cuisines</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '4px 0 0 0' }}>Showing all matching restaurants across all cuisines</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {getFilteredRestaurants().map(({ cuisineName, restaurant }) => (
              <div 
                key={restaurant.id} 
                onClick={() => { setSelectedRestaurant(restaurant); setActiveFilter(null); }}
                style={{ backgroundColor: '#1E1E24', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2E2E38', display: 'flex', gap: '16px', padding: '16px', cursor: 'pointer' }}
              >
                <div style={{ width: '100px', height: '100px', position: 'relative', flexShrink: 0 }}>
                  <img src={restaurant.image} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                  <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#FF5A36', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '4px' }}>
                    {cuisineName}
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{restaurant.name}</h4>
                    <span style={{ color: '#FFB800', fontWeight: 'bold', fontSize: '13px' }}>{restaurant.rating}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>
                    <span>⏱️ {restaurant.time}</span>
                    <span>•</span>
                    <span>{restaurant.price}</span>
                  </div>
                  <span style={{ color: '#FF5A36', fontSize: '12px', fontWeight: 'bold' }}>View Menu →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter View: Item Results */}
      {!searchQuery && activeFilter && ['🌱 Vegan / Healthy', '💳 Under $15'].includes(activeFilter) && (
        <section style={{ width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF' }}>{activeFilter} Items across Cuisines</h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '4px 0 0 0' }}>Showing all matching menu items from every restaurant</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {getFilteredMenuItems().map(({ cuisineName, restaurantName, item }) => (
              <div key={item.id} style={{ backgroundColor: '#1E1E24', borderRadius: '16px', padding: '18px', border: '1px solid #2E2E38', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '11px', color: '#FFB800' }}>
                    <span>{cuisineName}</span>
                    <span>•</span>
                    <span>{restaurantName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: `1.5px solid ${item.isVeg ? '#10B981' : '#EF4444'}`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '3px',
                      flexShrink: 0
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.isVeg ? '#10B981' : '#EF4444' }} />
                    </div>
                    <h5 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#FFF' }}>{item.name}</h5>
                  </div>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '0 0 10px 0', lineHeight: '1.4' }}>{item.description}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFB800' }}>${item.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleAddToCart({ ...item, restaurantName })}
                    style={{ 
                      padding: '8px 14px', 
                      backgroundColor: '#FF5A36', 
                      color: '#FFF', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontWeight: 'bold', 
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 0 10px rgba(255, 90, 54, 0.3)'
                    }}
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Default View 1: Cuisines Grid */}
      {!searchQuery && !activeFilter && !selectedCuisine && !selectedRestaurant && (
        <section style={{ width: '100%', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>🧭</span>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>Explore Cuisines</h3>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '16px', 
            width: '100%' 
          }}>
            {CUISINES_DATA.map((cuisine) => (
              <div 
                key={cuisine.id} 
                onClick={() => setSelectedCuisine(cuisine)}
                style={{ 
                  height: '180px', 
                  position: 'relative', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid #2E2E38', 
                  backgroundColor: '#1E1E24', 
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#FF5A36';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#2E2E38';
                }}
              >
                <img 
                  src={cuisine.image} 
                  alt={cuisine.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  justifyContent: 'center', 
                  padding: '12px',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(13,13,17,0.9) 100%)' 
                }}>
                  <span style={{ 
                    color: '#FFFFFF', 
                    backgroundColor: 'rgba(30, 30, 36, 0.85)', 
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)', 
                    padding: '6px 14px', 
                    borderRadius: '20px', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    {cuisine.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Default View 2: Restaurants in Cuisine */}
      {!searchQuery && !activeFilter && selectedCuisine && !selectedRestaurant && (
        <section style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span>🔥</span>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#FFFFFF' }}>10 Best {selectedCuisine.name} Restaurants</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {selectedCuisine.restaurants.map((resto) => (
              <div 
                key={resto.id} 
                onClick={() => setSelectedRestaurant(resto)}
                style={{ backgroundColor: '#1E1E24', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2E2E38', display: 'flex', gap: '16px', padding: '16px', cursor: 'pointer' }}
              >
                <div style={{ width: '100px', height: '100px', position: 'relative', flexShrink: 0 }}>
                  <img src={resto.image} alt={resto.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                  <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#FF5A36', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '4px' }}>
                    {resto.badge}
                  </span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{resto.name}</h4>
                    <span style={{ color: '#FFB800', fontWeight: 'bold', fontSize: '13px' }}>{resto.rating}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>
                    <span>⏱️ {resto.time}</span>
                    <span>•</span>
                    <span>{resto.price}</span>
                  </div>
                  <span style={{ color: '#FF5A36', fontSize: '12px', fontWeight: 'bold' }}>View Menu →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Default View 3: Restaurant Menu */}
      {!searchQuery && !activeFilter && selectedRestaurant && (
        <section style={{ width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF', margin: '0 0 6px 0' }}>{selectedRestaurant.name}</h3>
            <p style={{ color: '#9CA3AF', margin: 0, fontSize: '14px' }}>Select from our fresh culinary choices below:</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {selectedRestaurant.menu.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#1E1E24', borderRadius: '16px', padding: '18px', border: '1px solid #2E2E38', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: `1.5px solid ${item.isVeg ? '#10B981' : '#EF4444'}`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '3px',
                      flexShrink: 0
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.isVeg ? '#10B981' : '#EF4444' }} />
                    </div>
                    <h5 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#FFF' }}>{item.name}</h5>
                  </div>
                  
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: '0 0 10px 0', lineHeight: '1.4' }}>{item.description}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFB800' }}>${item.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleAddToCart({ ...item, restaurantName: selectedRestaurant.name })}
                    style={{ 
                      padding: '8px 14px', 
                      backgroundColor: '#FF5A36', 
                      color: '#FFF', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontWeight: 'bold', 
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 0 10px rgba(255, 90, 54, 0.3)'
                    }}
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Cart Drawer */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }}>
          <div style={{ width: '100%', maxWidth: '380px', height: '100%', backgroundColor: '#1E1E24', borderLeft: '1px solid #2E2E38', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Your Cart ({totalCartCount})</h3>
                <button onClick={() => setIsCartOpen(false)} style={{ backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF' }}>Your cart is empty</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Add items from a restaurant to get started.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ backgroundColor: '#0D0D11', borderRadius: '12px', padding: '12px', border: '1px solid #2E2E38' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</span>
                        <button onClick={() => removeFromCart(item.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#FFB800', fontWeight: 'bold', fontSize: '14px' }}>${(item.price * item.quantity).toFixed(2)}</span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1E1E24', borderRadius: '6px', padding: '2px 8px' }}>
                          <button onClick={() => handleQuantityChange(item.id, -1)} style={{ backgroundColor: 'transparent', border: 'none', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)} style={{ backgroundColor: 'transparent', border: 'none', color: '#FFF', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Total Amount:</span>
                <span style={{ color: '#FF5A36' }}>${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                disabled={cartItems.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  backgroundColor: cartItems.length > 0 ? '#FF5A36' : '#2E2E38', 
                  color: cartItems.length > 0 ? '#FFF' : '#6B7280', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  cursor: cartItems.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: cartItems.length > 0 ? '0 0 15px rgba(255, 90, 54, 0.3)' : 'none'
                }}
              >
                Checkout • ${cartTotal.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        onAddToCart={(meal) => {
          handleAddToCart({
            id: meal.id,
            name: meal.name,
            price: meal.price,
            isVeg: meal.category?.toLowerCase().includes('veg') ?? true,
            description: meal.description,
            restaurantName: 'AI Recommendation'
          });
        }}
      />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)} 
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        orderId={completedOrderId || ''}
        onClose={() => {
          setIsSuccessModalOpen(false);
          setCompletedOrderId(null);
        }}
        onTrackOrder={() => {
          setIsSuccessModalOpen(false);
          setIsTrackingOpen(true);
        }}
      />

      {/* Live Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackingOpen}
        orderId={completedOrderId || '1001'}
        onClose={() => {
          setIsTrackingOpen(false);
          setCompletedOrderId(null);
        }}
      />

    </div>
  );
}