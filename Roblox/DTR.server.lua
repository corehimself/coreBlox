-------
-- Made by: corehimself
-- Created: 2/28/2023
-- Updated: 8/24/2024
-------
local Players = game:GetService("Players");
local MessagingService = game:GetService("MessagingService");
local HTTPService = game:GetService("HttpService");

type moderationLike = {
	UserIds: { number },
	DisplayReason: string,
	Method: "Kick" | "Warn",
};

local function customFunction(playerModerated: Player, data: moderationLike)
	-- an accessible function to trigger external signals
	-- events, kick, etc as needed
	local reason = data.DisplayReason;
	local actionType = data.Method;

	if (actionType == "Kick") then
		playerModerated:Kick(reason);
	end
end

MessagingService:SubscribeAsync("DTR", function(data)
	data = HTTPService:JSONDecode(data.Data);

	local userId = data.UserIds[1];
	local player = Players:GetPlayerByUserId(userId)

	if (player) then
		customFunction(player, data);
	end
end);