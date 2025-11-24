function na=nbmaps(g,H,i,nb,rm)   % C Bandt Oct. 2025
% computes neighbor maps of piece i of next level within bounding circle
% procedure used by scenery.m   
m=size(H,3); na=zeros(2,3,100); n=0; bound=2*rm^2;  
Hi=inv(H(:,1:2,i));      % s_i^-1, must be integer matrix 
for j=1:m; if j~=i       % sibling neighbors
   v=H(:,3,j)-H(:,3,i);
   if v'*v<=bound      
       n=n+1; na(:,:,n)=Hi*[H(:,1:2,j) v]; % even if later cancelled
   end
end; end
if length(nb)>0; for k=1:size(nb,3)  % neighbors from list
   for j=1:m
       v=nb(:,1:2,k)*H(:,3,j)+g*nb(:,3,k)-H(:,3,i);
       if v'*v<=bound       
       n=n+1; na(:,:,n)=Hi*[nb(:,1:2,k)*H(:,1:2,j) v]; 
       end
   end
end; end
na=na(:,:,1:n);