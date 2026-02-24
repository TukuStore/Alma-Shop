import{s as d}from"./index-B7VyGmnV.js";async function c(e){const t=e?.page??1,a=e?.limit,i=(t-1)*a;let r=d.from("orders").select(`
      *,
      profile:profiles(full_name, avatar_url, phone_number),
      order_items(id, quantity, price_at_purchase, product:products(id, name, images, price))
    `,{count:"exact"});e?.status&&e.status!=="all"&&(r=r.eq("status",e.status)),e?.search&&(r=r.ilike("id",`%${e.search}%`)),r=r.order("created_at",{ascending:!1}).range(i,i+a-1);const{data:o,error:s,count:n}=await r;if(s)throw s;return{data:o??[],count:n??0}}async function l(e){const{data:t,error:a}=await d.from("orders").select(`
      *,
      profile:profiles(full_name, avatar_url, phone_number),
      order_items(id, quantity, price_at_purchase, product:products(id, name, images, price))
    `).eq("id",e).single();if(a)throw a;return t}async function m(e,t,a){const i={status:t,updated_at:new Date().toISOString()};a&&(i.courier=a.courier,i.tracking_number=a.tracking_number),t==="shipped"&&(i.shipped_at=new Date().toISOString());const{data:r,error:o}=await d.from("orders").update(i).eq("id",e).select("user_id").single();if(o)throw o;if(r?.user_id){let s="Status Pesanan Diperbarui",n=`Pesanan Anda #${e.split("-")[0].toUpperCase()} telah berstatus ${t}.`;t==="shipped"&&a?(s="Pesanan Dikirim",n=`Pesanan Anda sedang dikirim menggunakan ${a.courier}. Resi: ${a.tracking_number}`):t==="completed"&&(s="Pesanan Selesai",n="Pesanan Anda telah selesai. Terima kasih telah berbelanja!"),await d.from("notifications").insert({user_id:r.user_id,title:s,message:n,type:"order",is_read:!1,action_url:`/orders/${e}`})}}export{l as a,c as g,m as u};
