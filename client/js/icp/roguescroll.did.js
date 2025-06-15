export const idlFactory = ({ IDL }) => {
    const ActorState = IDL.Record({
        position: IDL.Record({
            x: IDL.Float64,
            y: IDL.Float64
        }),
        health: IDL.Nat,
        maxHealth: IDL.Nat,
        owner: IDL.Principal,
        lastUpdate: IDL.Nat64,
        sourceHash: IDL.Opt(IDL.Text)
    });

    const ActorUpdate = IDL.Record({
        actorId: IDL.Text,
        state: ActorState,
        owner: IDL.Principal
    });

    const Objective = IDL.Record({
        id: IDL.Text,
        description: IDL.Text,
        reward: IDL.Nat,
        deadline: IDL.Opt(IDL.Nat64),
        completed: IDL.Bool,
        completedBy: IDL.Opt(IDL.Principal)
    });

    const Result = IDL.Variant({
        ok: IDL.Bool,
        err: IDL.Text
    });

    return IDL.Service({
        authenticate: IDL.Func([], [IDL.Record({
            token: IDL.Text,
            principal: IDL.Principal
        })], ['query']),
        
        getOwnedActors: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
        
        subscribeToSharedActors: IDL.Func(
            [IDL.Func([ActorUpdate], [], [])],
            [],
            ['oneway']
        ),
        
        claimActor: IDL.Func(
            [IDL.Text],
            [Result],
            []
        ),
        
        releaseActor: IDL.Func(
            [IDL.Text],
            [Result],
            []
        ),
        
        updateActorState: IDL.Func(
            [IDL.Text, ActorState],
            [Result],
            []
        ),
        
        submitObjective: IDL.Func(
            [Objective],
            [Result],
            []
        ),
        
        getObjectives: IDL.Func(
            [],
            [IDL.Vec(Objective)],
            ['query']
        ),
        
        completeObjective: IDL.Func(
            [IDL.Text],
            [Result],
            []
        )
    });
}; 