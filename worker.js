
export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN;
    const origin = request.headers.get("Origin");

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (origin !== allowedOrigin) {
      return new Response("Forbidden", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const ticket = await request.json();

      const name = String(ticket.name || "").trim().slice(0, 80);
      const discord = String(ticket.discord || "").trim().slice(0, 80);
      const category = String(ticket.category || "").trim().slice(0, 60);
      const subject = String(ticket.subject || "").trim().slice(0, 120);
      const description = String(ticket.description || "").trim().slice(0, 1500);

      if (!name || !category || !subject || !description) {
        return new Response("Please complete all required fields.", {
          status: 400,
          headers: corsHeaders
        });
      }

      const reference = "MRD-" + crypto.randomUUID()
        .replace(/-/g, "")
        .slice(0, 8)
        .toUpperCase();

      const discordResponse = await fetch(env.https://discord.com/api/webhooks/1571167121927307334/LzhGsczNoCsIkXOmeLM-jAkUBttfW_n7XODfBGxs3eFkMxZ6ogPvhuCzcgnO3XlOowLH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowed_mentions: { parse: [] },
          embeds: [{
            title: "New Website Support Ticket",
            color: 0x38BDF8,
            fields: [
              { name: "Reference", value: reference },
              { name: "Name", value: name },
              { name: "Discord username", value: discord || "Not provided" },
              { name: "Category", value: category },
              { name: "Subject", value: subject },
              { name: "Description", value: description }
            ],
            footer: { text: "MRDJB87 Support System • V1.6.0" },
            timestamp: new Date().toISOString()
          }]
        })
      });

      if (!discordResponse.ok) {
        throw new Error("Discord webhook delivery failed");
      }

      return Response.json(
        { success: true, reference },
        { headers: corsHeaders }
      );

    } catch (error) {
      return Response.json(
        { success: false, message: "Unable to submit your ticket." },
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
