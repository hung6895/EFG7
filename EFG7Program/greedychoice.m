function i=greedychoice(g,H,nb,a,w)    % C Bandt Oct. 2025
% random choice of pieces, prefering those with more neighbors
% if w>0 (w=0 uniform choice), w=3 worked in many examples
m=size(H,3); u=zeros(m,1); bound=4*a^2;
for i=1:m; n=0;
   for j=1:m; if j~=i       
   v=H(:,3,j)-H(:,3,i);
   if v'*v<bound; n=n+1; end   % neighbors in smaller window
   end; end
   if length(nb)>0; for k=1:size(nb,3)
        for j=1:m
        v=nb(:,1:2,k)*H(:,3,j)+g*nb(:,3,k)-H(:,3,i);
        if v'*v<bound; n=n+1; end
        end
   end; end
u(i)=n; end; 
u=u.^w; u=cumsum(u)/sum(u);
i=min(find(u(:)>rand));

        